import { NextRequest, NextResponse } from 'next/server';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { encryptTokenServer } from '@/lib/crypto/encryption';

/**
 * Notion OAuth 2.0 - Handle Callback
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
      console.error('Notion OAuth error:', error);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=notion_auth_failed`);
    }

    if (!code || !stateParam) {
      return NextResponse.json({ error: 'Invalid callback parameters' }, { status: 400 });
    }

    // Decode state parameter
    const state = JSON.parse(Buffer.from(stateParam, 'base64').toString());
    const { teamId, setup } = state;

    // OAuth credentials
    const clientId = process.env.NOTION_CLIENT_ID;
    const clientSecret = process.env.NOTION_CLIENT_SECRET;
    const redirectUri = process.env.NOTION_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/notion/callback`;

    if (!clientId || !clientSecret) {
      console.error('Notion OAuth not configured');
      return NextResponse.json({ error: 'Notion integration not configured' }, { status: 500 });
    }

    // Exchange code for access token
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const tokenResponse = await fetch('https://api.notion.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Notion token exchange failed:', errorData);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=notion_token_failed`);
    }

    const data = await tokenResponse.json();
    const { access_token, workspace_name, workspace_icon, workspace_id, owner } = data;

    // Encrypt token
    const encryptedAccessToken = encryptTokenServer(access_token);

    // Store encrypted token in Firestore
    const integrationRef = doc(db, 'teams', teamId, 'integrations', 'notion');
    await setDoc(integrationRef, {
      provider: 'notion',
      connected: true,
      accessToken: encryptedAccessToken,
      workspaceId: workspace_id,
      workspaceName: workspace_name,
      workspaceIcon: workspace_icon,
      ownerType: owner?.type,
      ownerId: owner?.user?.id,
      connectedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log(`Notion connected successfully for team ${teamId}`);

    // Redirect based on setup flow or settings
    const redirectUrl = setup
      ? `${process.env.NEXT_PUBLIC_APP_URL}/setup?step=integrations&notion=success`
      : `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?notion=success`;

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Error handling Notion callback:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=notion_callback_failed`);
  }
}
