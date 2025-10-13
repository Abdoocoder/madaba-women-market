# Seller Approval Implementation

This document describes the implementation of the seller approval process to ensure that new sellers must be approved by an admin before they can add products to the marketplace.

## Problem

Previously, sellers could immediately add products right after registering a new account, even though their account status was set to "pending". This bypassed the intended admin approval workflow.

## Solution

The implementation includes the following changes:

### 1. Backend API Changes

**File: `app/api/products/route.ts`**

- Added a check in the POST endpoint to verify that the seller has been approved before allowing product creation
- Changed the default `approved` status for new products from `true` to `false`, requiring admin approval

```typescript
// Check if seller is approved before allowing product creation
if (user.status !== 'approved') {
    return NextResponse.json({ 
        message: 'Seller account pending approval',
        details: 'Your seller account is pending admin approval. You will be able to add products once approved.'
    }, { status: 403 });
}

// New products require admin approval
approved: false
```

### 2. Frontend UI Changes

**File: `app/seller/dashboard/page.tsx`**

- Added a check for seller approval status
- Disabled the "Add Product" button for pending sellers
- Added a notification banner for pending sellers
- Improved error handling for product creation attempts by pending sellers

```typescript
// Check if seller is approved
const isSellerApproved = user.status === 'approved';

// UI elements for pending sellers
{!isSellerApproved && (
  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
    <div className="flex items-center">
      <Clock className="h-5 w-5 text-yellow-600 mr-2" />
      <h3 className="font-medium text-yellow-800">{t("seller.pendingApprovalTitle")}</h3>
    </div>
    <p className="text-yellow-700 mt-1">{t("seller.pendingApprovalMessage")}</p>
  </div>
)}
```

### 3. Authentication Enhancement

**File: `lib/server-auth.ts`**

- Modified the authentication function to include the user's status in the returned user object
- This ensures that the approval status is available throughout the application

```typescript
status: userData?.status || 'approved', // Default to approved for non-sellers
```

### 4. Translation Updates

**Files: `locales/en/seller.json` and `locales/ar/seller.json`**

- Added new translation keys for the approval messages:
  - `pendingApprovalTitle`
  - `pendingApprovalMessage`
  - `productCreationError`

## How It Works

1. When a new seller registers, their account status is set to "pending" in the database
2. The seller can access their dashboard but cannot add products
3. Admins can approve sellers through the admin panel
4. Once approved, sellers can add products which will be created with `approved: false` status
5. Admins must also approve individual products before they appear on the site

## Benefits

- Ensures quality control over products on the marketplace
- Prevents unauthorized sellers from adding products
- Maintains the intended workflow where admins review both sellers and products
- Provides clear feedback to sellers about their approval status

## Testing

To test this implementation:

1. Register a new seller account
2. Verify that the seller cannot add products and sees the approval message
3. Approve the seller through the admin panel
4. Verify that the seller can now add products
5. Check that new products require admin approval before being visible to customers

## Future Improvements

- Add email notifications to sellers when their account is approved
- Add email notifications to admins when new sellers register
- Implement a more detailed seller application process
- Add seller rejection functionality with feedback