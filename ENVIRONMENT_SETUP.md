# Environment Setup Guide

## Overview
This document explains how to properly set up your environment variables for the Madaba Women Market application. The application requires Firebase and Cloudinary credentials to function correctly.

## Prerequisites
Before setting up the environment variables, you'll need:
1. A Firebase project
2. A Cloudinary account

## Environment Variables File
The application uses a `.env.local` file to store configuration variables. A sample file has been created at `.env.local` with placeholder values.

## Firebase Configuration

### Client-side Configuration
These variables are used by the frontend application:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain-here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id-here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket-here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id-here
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id-here
```

To obtain these values:
1. Go to the Firebase Console
2. Select your project
3. Go to Project Settings
4. Scroll down to the "Your apps" section
5. Copy the configuration values from your web app

### Admin SDK Configuration
These variables are used by the server-side API routes:

```
FIREBASE_PROJECT_ID=your-project-id-here
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
```

To obtain these values:
1. Go to the Firebase Console
2. Select your project
3. Go to Project Settings > Service Accounts
4. Click "Generate New Private Key"
5. Download the JSON file
6. Extract the required values from the JSON file

## Cloudinary Configuration

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name-here
CLOUDINARY_API_KEY=your-cloudinary-api-key-here
CLOUDINARY_API_SECRET=your-cloudinary-api-secret-here
```

To obtain these values:
1. Go to your Cloudinary Dashboard
2. Copy the values from the "Account Details" section

## Development vs Production

### Development Environment
For local development, you can use placeholder values in your `.env.local` file:

```
NODE_ENV=development
```

The application includes error handling that will gracefully handle missing or invalid credentials during development.

### Production Environment
For production deployment, ensure all variables contain valid credentials:

```
NODE_ENV=production
```

## Security Considerations

### Never Commit Credentials
Never commit your `.env.local` file to version control. The file is included in `.gitignore` to prevent accidental commits.

### Private Key Formatting
When adding the Firebase private key to your environment variables, ensure it maintains the correct formatting:
- Keep the newlines as `\n`
- Keep the quotes around the entire value

Example:
```
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

## Troubleshooting

### Missing Environment Variables
If you see warnings about missing environment variables:
1. Check that your `.env.local` file exists
2. Verify that all required variables are present
3. Restart your development server

### Authentication Errors
If you encounter authentication errors:
1. Verify that your Firebase credentials are correct
2. Ensure your Firebase project has the required services enabled (Authentication, Firestore)
3. Check that your security rules are properly configured

### Image Upload Errors
If image uploads fail:
1. Verify your Cloudinary credentials
2. Ensure your Cloudinary account is active
3. Check that you have created an upload preset in your Cloudinary settings

## Using the Setup Script
The repository includes a setup script to help you configure your environment:

```bash
bash setup-credentials.sh
```

This script will guide you through the process of obtaining and setting up your credentials.

## Verification
After setting up your environment variables:
1. Restart your development server
2. Check the console for successful Firebase initialization messages
3. Test authentication and image upload functionality