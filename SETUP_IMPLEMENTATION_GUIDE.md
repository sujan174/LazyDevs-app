# Setup Flow Implementation Guide

## Overview
This guide documents the new setup flow and what remains to be implemented.

## ✅ Completed

### 1. Token Encryption (`lib/crypto/encryption.ts`)
- ✅ Client-side encryption using Web Crypto API
- ✅ Server-side encryption for API routes
- ✅ AES-256-GCM encryption
- Uses `NEXT_PUBLIC_ENCRYPTION_KEY` environment variable

### 2. Integrations Setup Component (`components/setup/IntegrationsSetup.tsx`)
- ✅ OAuth integration cards for Jira, Slack, GitHub, Notion
- ✅ Skip functionality
- ✅ Complete setup button
- ✅ Redirects to OAuth flows with teamId and setup=true params

### 3. Updated Setup Flow (`app/setup/page.tsx`)
- ✅ New order: Team → Voice (optional) → Integrations (optional)
- ✅ Checks if user already has team
- ✅ Handles completion callbacks

## 🚧 TODO: Critical Updates

### 4. Update TeamSetup Component

**File**: `components/setup/TeamSetup.tsx`

**Changes Needed**:

```typescript
// Update interface to include onComplete callback
interface TeamSetupStepProps {
  user: User;
  onComplete: (teamId: string) => void; // ADD THIS
}

export function TeamSetupStep({ user, onComplete }: TeamSetupStepProps) {
  // ... existing code ...

  // In handleCreateTeam, after team is created:
  const newTeamDoc = await addDoc(teamCollectionRef, {
    name: teamName,
    creatorId: user.uid,
    members: [user.uid],
    createdAt: serverTimestamp(),
  });
  const userDocRef = doc(db, "users", user.uid);
  await updateDoc(userDocRef, { teamId: newTeamDoc.id });

  // Change setNewlyCreatedTeamId(newTeamDoc.id) to:
  onComplete(newTeamDoc.id); // Call parent callback instead

  // In handleJoinTeam, after joining:
  await updateDoc(teamDocRef, { members: arrayUnion(user.uid) });
  const userDocRef = doc(db, "users", user.uid);
  await updateDoc(userDocRef, { teamId: teamDoc.id });

  // Change router.push("/") to:
  onComplete(teamDoc.id); // Call parent callback

  // Update header text from "STEP 2 OF 2" to "STEP 1 OF 3"

  // Remove the success modal (lines 106-138)
  // The flow continues to voice setup now
}
```

### 5. Update VoiceSetup Component

**File**: `components/setup/VoiceSetup.tsx`

**Changes Needed**:

```typescript
// Update interface
interface VoiceSetupStepProps {
  user: User;
  onComplete: () => void;
  onSkip?: () => void; // ADD THIS - make it optional
}

export function VoiceSetupStep({ user, onComplete, onSkip }: VoiceSetupStepProps) {
  // ... existing code ...

  // Update header text from "STEP X OF Y" to "STEP 2 OF 3 (Optional)"

  // Add skip button before the submit button:
  return (
    <div className="bg-card rounded-xl shadow-lg p-8 ...">
      {/* ... existing header ... */}
      <div className="text-center mb-6">
        <p className="text-sm font-semibold text-primary">STEP 2 OF 3 (Optional)</p>
        <h1 className="text-3xl font-bold text-card-foreground mt-1">
          Voice Profile Setup
        </h1>
        <p className="text-muted-foreground mt-2">
          Record a voice sample to help identify you in meetings (you can skip this step)
        </p>
      </div>

      {/* ... existing form ... */}

      {/* Add skip button at the bottom */}
      <div className="mt-6 flex justify-between items-center">
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="text-muted-foreground hover:text-foreground transition-colors btn-smooth"
          >
            Skip for now
          </button>
        )}
        <div className="flex-1" />
        {/* Existing submit button */}
      </div>
    </div>
  );
}
```

## 🔧 TODO: OAuth API Routes

Create these API route files:

### 6a. Jira OAuth Routes

**File**: `app/api/integrations/jira/connect/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const teamId = searchParams.get('teamId');
  const isSetup = searchParams.get('setup');

  if (!teamId) {
    return NextResponse.json({ error: 'Team ID required' }, { status: 400 });
  }

  // Jira OAuth 2.0 configuration
  const clientId = process.env.JIRA_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/jira/callback`;
  const state = Buffer.from(JSON.stringify({ teamId, isSetup })).toString('base64');

  const authUrl = `https://auth.atlassian.com/authorize?` +
    `audience=api.atlassian.com&` +
    `client_id=${clientId}&` +
    `scope=read:jira-work write:jira-work offline_access&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `state=${state}&` +
    `response_type=code&` +
    `prompt=consent`;

  return NextResponse.redirect(authUrl);
}
```

**File**: `app/api/integrations/jira/callback/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase-admin';
import { encryptTokenServer } from '@/lib/crypto/encryption';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code || !state) {
    return NextResponse.redirect('/dashboard/settings?error=oauth_failed');
  }

  const { teamId, isSetup } = JSON.parse(Buffer.from(state, 'base64').toString());

  // Exchange code for tokens
  const tokenResponse = await fetch('https://auth.atlassian.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: process.env.JIRA_CLIENT_ID,
      client_secret: process.env.JIRA_CLIENT_SECRET,
      code,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/jira/callback`
    })
  });

  const tokens = await tokenResponse.json();

  // Encrypt and store tokens
  const encryptedAccessToken = encryptTokenServer(tokens.access_token);
  const encryptedRefreshToken = tokens.refresh_token ? encryptTokenServer(tokens.refresh_token) : null;

  const teamDocRef = doc(db, 'teams', teamId);
  await setDoc(teamDocRef, {
    integrations: {
      jira: {
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        connectedAt: new Date(),
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000)
      }
    }
  }, { merge: true });

  // Redirect based on context
  const redirectUrl = isSetup === 'true'
    ? '/setup?integration=jira&status=success'
    : '/dashboard/settings?integration=jira&status=success';

  return NextResponse.redirect(redirectUrl);
}
```

### 6b-6d. Similar Routes for Slack, GitHub, Notion

Copy the same pattern for each integration with their specific OAuth endpoints:

- **Slack**: `https://slack.com/oauth/v2/authorize` and `https://slack.com/api/oauth.v2.access`
- **GitHub**: `https://github.com/login/oauth/authorize` and `https://github.com/login/oauth/access_token`
- **Notion**: `https://api.notion.com/v1/oauth/authorize` and `https://api.notion.com/v1/oauth/token`

## 🎨 TODO: Improved Settings Page

**File**: `app/dashboard/settings/page.tsx`

Update the Integrations component to support all 4 integrations:

```typescript
const integrations = [
  {
    id: 'jira',
    name: 'Jira',
    description: 'Manage tasks and issues',
    logo: JiraIcon,
    isConnected: !!teamData?.integrations?.jira?.accessToken
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send summaries to channels',
    logo: SlackIcon,
    isConnected: !!teamData?.integrations?.slack?.accessToken
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Create issues from action items',
    logo: GitHubIcon,
    isConnected: !!teamData?.integrations?.github?.accessToken
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Sync meeting notes',
    logo: NotionIcon,
    isConnected: !!teamData?.integrations?.notion?.accessToken
  },
  {
    id: 'clickup',
    name: 'ClickUp',
    description: 'Manage tasks and projects',
    logo: ClickUpLogo,
    isConnected: !!teamData?.integrations?.clickup?.accessToken
  }
];

// Map through integrations instead of hardcoding ClickUp only
```

## 📝 Environment Variables Needed

Add to `.env.local`:

```bash
# Encryption
NEXT_PUBLIC_ENCRYPTION_KEY=your-32-character-encryption-key-here

# Jira OAuth
JIRA_CLIENT_ID=your_jira_client_id
JIRA_CLIENT_SECRET=your_jira_client_secret

# Slack OAuth
SLACK_CLIENT_ID=your_slack_client_id
SLACK_CLIENT_SECRET=your_slack_client_secret

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Notion OAuth
NOTION_CLIENT_ID=your_notion_client_id
NOTION_CLIENT_SECRET=your_notion_client_secret

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🔒 Security Notes

1. **Encryption**: All tokens are encrypted before storage using AES-256-GCM
2. **Environment Variables**: Never commit `.env.local` to git
3. **Token Refresh**: Implement token refresh logic in production
4. **Scopes**: Request minimum necessary OAuth scopes
5. **State Parameter**: Prevents CSRF attacks in OAuth flow

## 📊 Database Schema

Firestore `teams` collection will have:

```typescript
{
  integrations: {
    jira?: {
      accessToken: string (encrypted),
      refreshToken?: string (encrypted),
      connectedAt: Timestamp,
      expiresAt: Timestamp
    },
    slack?: { /* same structure */ },
    github?: { /* same structure */ },
    notion?: { /* same structure */ },
    clickup?: { /* same structure */ }
  }
}
```

## 🧪 Testing Checklist

- [ ] User can create team and proceed to voice setup
- [ ] User can join team and proceed to voice setup
- [ ] User can skip voice setup
- [ ] User can connect integrations during setup
- [ ] User can skip integrations and complete setup
- [ ] User can manage integrations from settings
- [ ] Tokens are properly encrypted in database
- [ ] OAuth callbacks work for all providers
- [ ] Disconnecting integrations works
- [ ] Setup flow redirects to dashboard when complete

## 🚀 Deployment Notes

1. Register OAuth apps with each provider
2. Set up callback URLs in each provider's dashboard
3. Add environment variables to production
4. Test OAuth flows in production domain
5. Monitor encrypted token storage
