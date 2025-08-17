# DrivInn Project Index - Stripe Integration & Host Registration

## Project Overview
DrivInn is a rental platform that allows users to list and book properties (apartments, houses, cars). The platform uses Stripe for payment processing and host onboarding through Stripe Connect Express accounts.

## Project Structure

### Frontend (`/frontend`)
- **Framework**: React 19.1.0 with React Router v7
- **Styling**: Styled Components + Bootstrap
- **Payment Integration**: Stripe React components (`@stripe/react-stripe-js`, `@stripe/stripe-js`)

### Backend (`/backend`)
- **Runtime**: Node.js with Express 5.1.0
- **Database**: MongoDB with Mongoose
- **Payment Processing**: Stripe SDK v18.4.0
- **File Uploads**: Multer for document processing

## Stripe Integration Architecture

### 1. Host Application & Stripe Connect Account Creation

#### Frontend Components
- **`HostApplicationForm.js`**: Multi-step form for host applications
  - Step 1: Personal Information (name, email, phone, address)
  - Step 2: Identity Verification (ID documents, selfie)
  - Step 3: Business & Financial Information (SSN, bank details)
  - Step 4: Payment Methods (Stripe account setup)
  - Step 5: Property Information & Review

#### Backend Controllers
- **`hostApplicationController.js`**: Handles application submission and Stripe account creation
  - `submitApplication()`: Creates Stripe Connect Express account during submission
  - `approveApplication()`: Approves applications and generates onboarding links
  - `refreshStripeAccountStatus()`: Updates Stripe account status
  - `createStripeLoginLink()`: Creates Stripe dashboard access links

#### Key Stripe Integration Points
```javascript
// Stripe Connect Express account creation
const account = await stripe.accounts.create({
  type: 'express',
  country: countryCode,
  email: req.body.email,
  capabilities: {
    card_payments: { requested: true },
    transfers: { requested: true },
    tax_reporting_us_1099_k: { requested: true },
  },
  business_type: businessStructure,
  // ... additional configuration
});
```

### 2. Stripe Connect Account Management

#### Account Types
- **Express Accounts**: Simplified onboarding for hosts
- **Automatic Payouts**: Platform handles transfers to host accounts
- **Automatic Capture**: Payments are automatically captured and transferred

#### Account Status Tracking
```javascript
stripeConnect: {
  accountId: String,
  accountStatus: ['pending', 'active', 'restricted', 'disabled'],
  onboardingCompleted: Boolean,
  pendingRequirements: Mixed
}
```

### 3. Payment Flow & Payouts

#### Guest Payment Process
1. Guest selects property and dates
2. Stripe Checkout session created with `transfer_data`
3. Payment automatically captured and transferred to host's Stripe Connect account
4. Platform fee (10%) automatically deducted

#### Webhook Processing
- **`server.js`**: Handles Stripe webhooks
- Processes `checkout.session.completed` events
- Updates booking status and payment records

### 4. API Endpoints

#### Host Applications
```javascript
POST /host-applications          // Submit application + create Stripe account
GET  /host-applications/me      // Get user's application
POST /host-applications/refresh-stripe-status    // Update Stripe status
POST /host-applications/create-stripe-login-link // Generate dashboard link
GET  /host-applications/stripe-setup-status      // Get setup progress
```

#### Admin Routes
```javascript
GET  /host-applications          // List all applications (admin only)
PUT  /host-applications/:id/approve  // Approve application
PUT  /host-applications/:id/decline  // Decline application
```

### 5. Data Models

#### HostApplication Schema
```javascript
{
  // Personal Information
  firstName, lastName, email, phoneNumber, dateOfBirth,
  street, city, state, postalCode, country,
  
  // Identity Verification
  idType, idNumber, idFrontImage, idBackImage, selfieImage,
  
  // Business Information
  businessName, businessTaxId, businessStructure,
  businessAddress, businessPhone,
  
  // Financial Information
  ssn, ssnLast4, supportPhone,
  bankAccount: { accountNumber, routingNumber, accountType },
  
  // Stripe Connect Integration
  stripeConnect: {
    accountId, accountStatus, onboardingCompleted, pendingRequirements
  },
  
  // Property Information
  propertyType, propertyDescription, hostingExperience
}
```

#### User Schema Updates
```javascript
{
  role: 'host',
  hostProfile: {
    stripeConnectAccountId: String,
    stripeConnectStatus: String,
    // ... other host-specific fields
  }
}
```

### 6. Environment Configuration

#### Required Environment Variables
```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_xxx          # Stripe secret key
STRIPE_WEBHOOK_SECRET=whsec_xxx        # Webhook endpoint secret
FRONTEND_URL=http://localhost:3000     # Frontend URL for redirects

# Database & Server
MONGODB_URI=mongodb://localhost:27017/drivinn
PORT=5000
JWT_SECRET=your_jwt_secret

# Email & File Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 7. Security & Compliance

#### Identity Verification
- Government-issued ID documents (front/back)
- Selfie verification
- SSN validation (last 4 digits)
- Business verification for company accounts

#### Stripe Compliance
- KYC (Know Your Customer) requirements
- 1099-K tax reporting setup
- PCI compliance through Stripe
- Secure document storage

### 8. User Experience Flow

#### Host Onboarding
1. **Application Submission**: Complete multi-step form
2. **Document Upload**: ID verification and business documents
3. **Stripe Account Creation**: Automatic during submission
4. **Admin Review**: 2-3 business day review process
5. **Approval & Onboarding**: Complete Stripe verification
6. **Active Hosting**: Start receiving payments

#### Guest Booking
1. **Property Selection**: Browse available listings
2. **Payment**: Stripe Checkout with automatic host payout
3. **Confirmation**: Booking confirmed with payment verification

### 9. Error Handling & Monitoring

#### Stripe Error Handling
- Account creation failures
- Webhook signature verification
- Transfer failures

#### Application Status Tracking
- Pending admin review
- Stripe verification requirements
- Onboarding completion status
- Account activation status

### 10. Development & Testing

#### Local Development
```bash
# Backend
cd backend
npm install
npm start

# Frontend
cd frontend
npm install
npm start
```

#### Stripe Testing
- Use Stripe test keys for development
- Test webhook endpoints with Stripe CLI
- Verify Connect account creation flow
- Test payment scenarios

## Key Files Summary

### Frontend
- `HostApplicationForm.js` - Main application form
- `HostApplicationStatus.js` - Application status display
- `AdminHostApplicationsPanel.js` - Admin management interface
- `api.js` - API service calls

### Backend
- `hostApplicationController.js` - Core business logic
- `server.js` - Stripe webhook handling
- `HostApplication.js` - Data model
- `hostApplications.js` - API routes

### Configuration
- `package.json` files - Dependencies
- `.env` files - Environment variables (not in repo)
- `AUTOMATIC_PAYOUT_FIXES.md` - Implementation details

## Integration Points

1. **Stripe Connect**: Host account creation and management
2. **Payment Processing**: Guest payments and host payouts
3. **Document Management**: ID verification and business documents
4. **Admin Workflow**: Application review and approval process
5. **Notification System**: Email and in-app notifications
6. **Payout Automation**: Automatic transfers to host accounts

This architecture provides a complete Stripe-integrated hosting platform with automated payouts, secure identity verification, and comprehensive admin management tools. 