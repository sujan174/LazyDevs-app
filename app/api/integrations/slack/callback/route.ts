import { NextRequest, NextResponse } from 'next/server';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { encryptTokenServer } from '@/lib/crypto/encryption';

/**
 * Slack OAuth 2.0 - Handle Callback
 * Exchanges authorization code for access token and stores encrypted tokens
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const stateParam = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      console.error('Slack OAuth error:', error);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=slack_auth_failed`);
    }

    if (!code || !stateParam) {
      return NextResponse.json({ error: 'Invalid callback parameters' }, { status: 400 });
    }

    // Decode state parameter
    const state = JSON.parse(Buffer.from(stateParam, 'base64').toString());
    const { teamId, setup } = state;

    // OAuth credentials
    const clientId = process.env.SLACK_CLIENT_ID;
    const clientSecret = process.env.SLACK_CLIENT_SECRET;
    const redirectUri = process.env.SLACK_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/slack/callback`;

    if (!clientId || !clientSecret) {
      console.error('Slack OAuth not configured');
      return NextResponse.json({ error: 'Slack integration not configured' }, { status: 500 });
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Slack token exchange failed:', errorData);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=slack_token_failed`);
    }

    const data = await tokenResponse.json();

    if (!data.ok) {
      console.error('Slack API error:', data.error);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=slack_api_failed`);
    }

    const { access_token, team, authed_user } = data;

    // Encrypt tokens
    const encryptedAccessToken = encryptTokenServer(access_token);
    const encryptedUserToken = authed_user?.access_token
      ? encryptTokenServer(authed_user.access_token)
      : null;

    // Store encrypted tokens in Firestore
    const integrationRef = doc(db, 'teams', teamId, 'integrations', 'slack');
    await setDoc(integrationRef, {
      provider: 'slack',
      connected: true,
      accessToken: encryptedAccessToken,
      userToken: encryptedUserToken,
      slackTeamId: team?.id,
      slackTeamName: team?.name,
      userId: authed_user?.id,
      connectedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log(`Slack connected successfully for team ${teamId}`);

    // Redirect based on setup flow or settings
    const redirectUrl = setup
      ? `${process.env.NEXT_PUBLIC_APP_URL}/setup?step=integrations&slack=success`
      : `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?slack=success`;

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Error handling Slack callback:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=slack_callback_failed`);
  }
}
