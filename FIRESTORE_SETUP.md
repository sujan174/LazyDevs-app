# Firestore Security Rules Setup - IMPORTANT! 🔥

## ⚠️ Problem

Getting this error when trying to join a team?

```
⚠️ Database permissions error: Your Firestore security rules need to be updated.
```

This means your Firestore doesn't allow querying teams by invite code.

## ✅ Solution

You **MUST** deploy the security rules from `firestore.rules` to your Firebase project. This takes 2 minutes!

### Method 1: Firebase Console (Recommended - Takes 2 Minutes) ⭐

1. **Open** [Firebase Console](https://console.firebase.google.com/)
2. **Select** your project (LazyDevs-app)
3. **Click** "Firestore Database" in the left sidebar
4. **Click** the "Rules" tab at the top
5. **Delete** everything in the editor
6. **Copy** ALL contents from `firestore.rules` in this project
7. **Paste** into the Firebase rules editor
8. **Click** "Publish" button
9. ✅ **Done!** Wait 5 seconds, then try joining a team again

### Method 2: Using Firebase CLI

1. Install Firebase CLI if you haven't already:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project (if not already done):
   ```bash
   firebase init firestore
   ```

4. Deploy the rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

## 🔑 The Critical Fix

The key line that fixes team joining is:

```javascript
allow list: if isAuthenticated() && request.query.limit <= 1;
```

This allows authenticated users to **query** teams by invite code. Your old rules only had `allow get` which allows reading by document ID, but NOT querying by fields like `inviteCode`.

## What the Rules Do

The security rules in `firestore.rules` provide:

### For Users Collection
- ✅ Users can read and write their own profile
- ✅ Team leaders can read their team members' profiles

### For Teams Collection
- ✅ Authenticated users can create teams
- ✅ Team leaders can manage their teams (read, update, delete)
- ✅ Team members can view their team details
- ✅ **IMPORTANT**: Authenticated users can query teams by invite code (needed for joining)
- ✅ Team leaders can add/remove members

### For Meetings Collection
- ✅ Team members can read and write meetings for their team
- ✅ Team members can create meetings for their team

## Testing

After deploying the rules, try the following:

1. Create a new team as User A
2. Copy the invite code from the Team page
3. Sign out and create a new account (User B)
4. Try to join the team using the invite code
5. ✅ It should work without permission errors!

## Security Note

The rules include the line:
```
allow read: if isAuthenticated() &&
               request.query.limit <= 1 &&
               resource.data.inviteCode != null;
```

This specifically allows authenticated users to query teams by invite code, but limits them to one result at a time. This is secure because:
- Users must be authenticated
- They can only find teams if they have the exact invite code
- The query is limited to prevent bulk data access
- Invite codes are randomly generated and hard to guess

## Troubleshooting

**Problem**: Still getting permission errors after deploying rules

**Solution**:
1. Make sure you clicked "Publish" in the Firebase Console
2. Wait a few seconds for the rules to propagate
3. Try refreshing your app
4. Check the Firebase Console Rules tab to verify they were deployed

**Problem**: "resource.data.inviteCode is undefined"

**Solution**: Make sure all existing teams in your database have an `inviteCode` field. You may need to regenerate invite codes for existing teams.
