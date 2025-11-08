import { NextRequest, NextResponse } from 'next/server';

/**
 * Slack OAuth 2.0 - Initiate Connection
 * Redirects user to Slack authorization page
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
    const clientId = process.env.SLACK_CLIENT_ID;
    const redirectUri = process.env.SLACK_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/slack/callback`;

    if (!clientId) {
      console.error('Slack OAuth not configured: Missing SLACK_CLIENT_ID');
      return NextResponse.json({ error: 'Slack integration not configured' }, { status: 500 });
    }

    // Generate state parameter for CSRF protection
    const state = Buffer.from(JSON.stringify({ teamId, setup: setup === 'true' })).toString('base64');

    // Slack OAuth 2.0 authorization URL
    const authUrl = new URL('https://slack.com/oauth/v2/authorize');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('scope', 'chat:write,channels:read,channels:join,files:write');
    authUrl.searchParams.set('user_scope', 'chat:write');
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', state);

    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error('Error initiating Slack OAuth:', error);
    return NextResponse.json({ error: 'Failed to initiate Slack connection' }, { status: 500 });
  }
}
