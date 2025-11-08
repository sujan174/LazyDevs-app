import { NextRequest, NextResponse } from 'next/server';

/**
 * Notion OAuth 2.0 - Initiate Connection
 * Redirects user to Notion authorization page
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
    const clientId = process.env.NOTION_CLIENT_ID;
    const redirectUri = process.env.NOTION_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/notion/callback`;

    if (!clientId) {
      console.error('Notion OAuth not configured: Missing NOTION_CLIENT_ID');
      return NextResponse.json({ error: 'Notion integration not configured' }, { status: 500 });
    }

    // Generate state parameter for CSRF protection
    const state = Buffer.from(JSON.stringify({ teamId, setup: setup === 'true' })).toString('base64');

    // Notion OAuth 2.0 authorization URL
    const authUrl = new URL('https://api.notion.com/v1/oauth/authorize');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('owner', 'user');
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', state);

    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error('Error initiating Notion OAuth:', error);
    return NextResponse.json({ error: 'Failed to initiate Notion connection' }, { status: 500 });
  }
}
