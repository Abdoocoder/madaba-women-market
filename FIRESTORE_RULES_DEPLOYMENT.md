# Firestore Rules Deployment Guide

This guide explains how to deploy the updated Firestore security rules that include permissions for the `carts` collection.

## Prerequisites

1. Firebase CLI must be installed
2. You must be logged into your Firebase account
3. You must be in the project directory

## Installation Steps

### 1. Install Firebase CLI (if not already installed)

```bash
npm install -g firebase-tools
```

### 2. Login to Firebase

```bash
firebase login
```

This will open a browser window where you can log in with your Google account that has access to the Firebase project.

### 3. Deploy the Rules

You can deploy the rules using either of these methods:

#### Method 1: Using the custom script (recommended)

```bash
npm run deploy-rules
```

#### Method 2: Using Firebase CLI directly

```bash
firebase deploy --only firestore:rules
```

## What the Updated Rules Do

The updated Firestore rules now include permissions for the `carts` collection:

```javascript
// Carts - users can only access their own cart
match /carts/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

This rule ensures that:
- Only authenticated users can read/write to cart documents
- Users can only access their own cart (document ID matches their user ID)
- No other users can access another user's cart data

## Troubleshooting

### Common Issues

1. **"Command not found: firebase"**
   - Make sure Firebase CLI is installed globally
   - Try `npx firebase-tools` instead

2. **Permission denied errors**
   - Make sure you're logged into the correct Firebase account
   - Verify you have the necessary permissions for the project

3. **Project not set up**
   - Run `firebase init` to initialize the project if needed

### Verifying Deployment

After deployment, you can verify the rules are active by:
1. Checking the Firebase Console > Firestore Database > Rules tab
2. Testing the application functionality that was previously failing

## Additional Security Considerations

The new rules follow the principle of least privilege:
- Users can only access their own cart data
- Authentication is required for all cart operations
- No public read/write access to cart data

If you need to modify these rules further, edit the `firestore.rules` file and redeploy using the same process.