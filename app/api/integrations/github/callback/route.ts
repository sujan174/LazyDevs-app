import { NextRequest, NextResponse } from 'next/server';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { encryptTokenServer } from '@/lib/crypto/encryption';

/**
 * GitHub OAuth 2.0 - Handle Callback
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
      console.error('GitHub OAuth error:', error);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=github_auth_failed`);
    }

    if (!code || !stateParam) {
      return NextResponse.json({ error: 'Invalid callback parameters' }, { status: 400 });
    }

    // Decode state parameter
    const state = JSON.parse(Buffer.from(stateParam, 'base64').toString());
    const { teamId, setup } = state;

    // OAuth credentials
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    const redirectUri = process.env.GITHUB_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/github/callback`;

    if (!clientId || !clientSecret) {
      console.error('GitHub OAuth not configured');
      return NextResponse.json({ error: 'GitHub integration not configured' }, { status: 500 });
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('GitHub token exchange failed:', errorData);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=github_token_failed`);
    }

    const data = await tokenResponse.json();

    if (data.error) {
      console.error('GitHub API error:', data.error_description);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=github_api_failed`);
    }

    const { access_token, scope, token_type } = data;

    // Get user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Accept': 'application/json',
      },
    });

    const user = await userResponse.json();

    // Encrypt token
    const encryptedAccessToken = encryptTokenServer(access_token);

    // Store encrypted token in Firestore
    const integrationRef = doc(db, 'teams', teamId, 'integrations', 'github');
    await setDoc(integrationRef, {
      provider: 'github',
      connected: true,
      accessToken: encryptedAccessToken,
      scope,
      tokenType: token_type,
      username: user.login,
      userId: user.id,
      avatarUrl: user.avatar_url,
      connectedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log(`GitHub connected successfully for team ${teamId}`);

    // Redirect based on setup flow or settings
    const redirectUrl = setup
      ? `${process.env.NEXT_PUBLIC_APP_URL}/setup?step=integrations&github=success`
      : `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?github=success`;

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Error handling GitHub callback:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=github_callback_failed`);
  }
}
