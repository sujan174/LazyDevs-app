import { NextRequest, NextResponse } from 'next/server';

/**
 * Jira OAuth 2.0 - Initiate Connection
 * Redirects user to Jira authorization page
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
    const clientId = process.env.JIRA_CLIENT_ID;
    const redirectUri = process.env.JIRA_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/jira/callback`;

    if (!clientId) {
      console.error('Jira OAuth not configured: Missing JIRA_CLIENT_ID');
      return NextResponse.json({ error: 'Jira integration not configured' }, { status: 500 });
    }

    // Generate state parameter for CSRF protection
    const state = Buffer.from(JSON.stringify({ teamId, setup: setup === 'true' })).toString('base64');

    // Jira OAuth 2.0 authorization URL
    const authUrl = new URL('https://auth.atlassian.com/authorize');
    authUrl.searchParams.set('audience', 'api.atlassian.com');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('scope', 'read:jira-work write:jira-work offline_access');
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('prompt', 'consent');

    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error('Error initiating Jira OAuth:', error);
    return NextResponse.json({ error: 'Failed to initiate Jira connection' }, { status: 500 });
  }
}
