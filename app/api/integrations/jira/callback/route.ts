import { NextRequest, NextResponse } from 'next/server';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { encryptTokenServer } from '@/lib/crypto/encryption';

/**
 * Jira OAuth 2.0 - Handle Callback
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
      console.error('Jira OAuth error:', error);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=jira_auth_failed`);
    }

    if (!code || !stateParam) {
      return NextResponse.json({ error: 'Invalid callback parameters' }, { status: 400 });
    }

    // Decode state parameter
    const state = JSON.parse(Buffer.from(stateParam, 'base64').toString());
    const { teamId, setup } = state;

    // OAuth credentials
    const clientId = process.env.JIRA_CLIENT_ID;
    const clientSecret = process.env.JIRA_CLIENT_SECRET;
    const redirectUri = process.env.JIRA_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/jira/callback`;

    if (!clientId || !clientSecret) {
      console.error('Jira OAuth not configured');
      return NextResponse.json({ error: 'Jira integration not configured' }, { status: 500 });
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://auth.atlassian.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Jira token exchange failed:', errorData);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=jira_token_failed`);
    }

    const tokens = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokens;

    // Encrypt tokens
    const encryptedAccessToken = encryptTokenServer(access_token);
    const encryptedRefreshToken = refresh_token ? encryptTokenServer(refresh_token) : null;

    // Get accessible resources (Jira sites)
    const resourcesResponse = await fetch('https://api.atlassian.com/oauth/token/accessible-resources', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Accept': 'application/json',
      },
    });

    const resources = await resourcesResponse.json();
    const cloudId = resources[0]?.id;
    const siteName = resources[0]?.name;

    // Store encrypted tokens in Firestore
    const integrationRef = doc(db, 'teams', teamId, 'integrations', 'jira');
    await setDoc(integrationRef, {
      provider: 'jira',
      connected: true,
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
      expiresAt: new Date(Date.now() + expires_in * 1000),
      cloudId,
      siteName,
      connectedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log(`Jira connected successfully for team ${teamId}`);

    // Redirect based on setup flow or settings
    const redirectUrl = setup
      ? `${process.env.NEXT_PUBLIC_APP_URL}/setup?step=integrations&jira=success`
      : `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?jira=success`;

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Error handling Jira callback:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=jira_callback_failed`);
  }
}
