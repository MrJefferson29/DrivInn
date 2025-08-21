# Stripe Dashboard URL Dynamic Collection Implementation

## Overview
This implementation replaces the hardcoded Stripe dashboard URL (`bKsxnuQI7PAK`) with a dynamic system that collects and stores the actual dashboard URL from Stripe when host applications are created.

## Problem
Previously, the system used a hardcoded dashboard URL format:
```
https://connect.stripe.com/express/acct_{ACCOUNT_ID}/bKsxnuQI7PAK
```

This caused issues because:
- The `bKsxnuQI7PAK` part is unique to each Stripe account
- Using a hardcoded value could lead to broken dashboard links
- The system couldn't adapt to Stripe's actual URL structure

## Solution
The system now:
1. **Collects the actual dashboard URL** from Stripe when creating host applications
2. **Stores the URL** in the database for future use
3. **Uses the stored URL** instead of generating it
4. **Provides fallback** to the old method if needed

## Changes Made

### 1. Database Schema Update
**File:** `backend/models/HostApplication.js`
- Added `dashboardUrl` field to the `stripeConnect` object
- This field stores the actual Stripe dashboard URL

### 2. Backend Controller Updates
**File:** `backend/controllers/hostApplicationController.js`

#### Host Application Submission
- Modified `submitApplication` function to capture actual dashboard URL
- Creates a login link using `stripe.accounts.createLoginLink()`
- Stores the actual URL in `application.stripeConnect.dashboardUrl`
- Falls back to generated URL if login link creation fails

#### Dashboard URL Usage
- Updated all instances of `generateStripeDashboardUrl()` to use stored URL first
- Added fallback: `application.stripeConnect.dashboardUrl || generateStripeDashboardUrl(accountId)`

#### New Functions
- **`refreshDashboardUrl`**: Allows hosts to refresh their dashboard URL
- **Enhanced `createStripeLoginLink`**: Updates stored dashboard URL when creating new login links

### 3. Backend Route Updates
**File:** `backend/routes/hostApplications.js`
- Added new route: `POST /host-applications/refresh-dashboard-url`
- This allows hosts to refresh their dashboard URL

### 4. Frontend API Updates
**File:** `frontend/src/services/api.js`
- Added `refreshDashboardUrl()` function to the `hostApplicationsAPI`

### 5. Frontend Component Updates
**File:** `frontend/src/components/Navbar.js`
- Modified to use stored dashboard URL from backend
- Falls back to constructed URL if stored URL is not available

### 6. Other Controller Updates
**File:** `backend/controllers/bookingsController.js`
- Updated to use stored dashboard URL instead of generated one

## How It Works

### 1. Host Application Submission
```
User submits host application
↓
Stripe Connect account created
↓
Login link created to get actual dashboard URL
↓
Dashboard URL stored in database
↓
Response includes actual dashboard URL
```

### 2. Dashboard URL Usage
```
Frontend requests Stripe setup status
↓
Backend returns stored dashboard URL
↓
Frontend uses stored URL for dashboard links
↓
Fallback to generated URL if stored URL missing
```

### 3. URL Refresh Process
```
Host requests dashboard URL refresh
↓
New login link created with Stripe
↓
Updated dashboard URL stored in database
↓
Host receives fresh dashboard URL
```

## Benefits

1. **Accurate URLs**: Uses actual Stripe dashboard URLs instead of hardcoded ones
2. **Dynamic Updates**: Dashboard URLs can be refreshed when needed
3. **Fallback Support**: Maintains compatibility with existing functionality
4. **Better User Experience**: Hosts get working dashboard links
5. **Future-Proof**: Adapts to Stripe's URL structure changes

## API Endpoints

### New Endpoints
- `POST /host-applications/refresh-dashboard-url` - Refresh dashboard URL for existing hosts

### Updated Endpoints
- `POST /host-applications` - Now stores dashboard URL during submission
- `GET /host-applications/stripe-setup-status` - Returns stored dashboard URL
- `POST /host-applications/create-stripe-login-link` - Updates stored dashboard URL

## Database Changes

### HostApplication Model
```javascript
stripeConnect: {
  accountId: String,
  accountStatus: String,
  onboardingCompleted: Boolean,
  pendingRequirements: Mixed,
  dashboardUrl: String  // NEW FIELD
}
```

## Migration Notes

- **Existing Applications**: Will continue to work using fallback generated URLs
- **New Applications**: Will automatically store actual dashboard URLs
- **URL Refresh**: Hosts can refresh their dashboard URLs using the new endpoint
- **Backward Compatibility**: All existing functionality remains intact

## Testing

1. **Submit new host application** - Verify dashboard URL is captured and stored
2. **Check existing applications** - Verify fallback URLs still work
3. **Refresh dashboard URL** - Test the new refresh endpoint
4. **Frontend integration** - Verify dashboard links use stored URLs

## Future Enhancements

1. **Automatic URL Refresh**: Periodically refresh dashboard URLs for all hosts
2. **URL Validation**: Validate stored URLs before using them
3. **URL History**: Track changes to dashboard URLs over time
4. **Admin Dashboard**: Allow admins to view and manage dashboard URLs
