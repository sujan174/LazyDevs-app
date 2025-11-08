import { NextRequest, NextResponse } from 'next/server';

/**
 * GitHub OAuth 2.0 - Initiate Connection
 * Redirects user to GitHub authorization page
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const teamId = searchParams.get('teamId');
    const setup = searchParams.get('setup');

    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    // OAuth credentials from environment
    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri = process.env.GITHUB_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/github/callback`;

    if (!clientId) {
      console.error('GitHub OAuth not configured: Missing GITHUB_CLIENT_ID');
      return NextResponse.json({ error: 'GitHub integration not configured' }, { status: 500 });
    }

    // Generate state parameter for CSRF protection
    const state = Buffer.from(JSON.stringify({ teamId, setup: setup === 'true' })).toString('base64');

    // GitHub OAuth 2.0 authorization URL
    const authUrl = new URL('https://github.com/login/oauth/authorize');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', 'repo,write:org,read:user');
    authUrl.searchParams.set('state', state);

    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error('Error initiating GitHub OAuth:', error);
    return NextResponse.json({ error: 'Failed to initiate GitHub connection' }, { status: 500 });
  }
}
