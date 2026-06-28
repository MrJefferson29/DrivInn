<h1>DrivInn | Full-Stack Car & Accommodation Booking Platform</h1>
DrivInn is a robust, production-ready marketplace application designed to handle dual-category listings (vehicles and apartments). Built with a modern JavaScript stack, the platform manages end-to-end booking lifecycles, precise time-zone-aware scheduling, secure payment processing, and an automated host payout workflow.
<img width="1868" height="884" alt="Image" src="https://github.com/user-attachments/assets/5567f061-046b-452b-b50c-d651f247f3e7" />
🚀 Key Architectural Highlights (Portfolio Features)
Deterministic Booking Time Logic: Implemented a robust data-modeling fix that combines user-selected dates with host-defined check-in/check-out times into singular, unified UTC ISO DateTime objects at the database layer. This eliminates edge-case timezone slippage during automated status transitions.

Decoupled Delayed Payout Engine: Engineered a background cron/processor capable of evaluating booking lifecycle eligibility (checked_in or completed) alongside payment states to securely execute multi-party escrow-to-host payouts.

Production-Ready Network Topology: Refactored the global networking layout away from rigid local configurations (localhost) into highly flexible environment configurations, successfully routing secure production traffic across decoupled deployments on Vercel and Render.

<h3>🛠️ Tech Stack</h3>
Frontend: React.js, Context API, React Router, Socket.io-client (Real-time Messaging)

Backend: Node.js, Express.js, Socket.io (WebSockets), Passport.js (OAuth 2.0 Authentication)

Database: MongoDB & Mongoose ODM

Third-Party Integrations: Stripe (Payments & Connect Escrow Platform)

<h3>📦 System Architecture & Component Breakdown</h3>
<h5>1. Booking Workflow & State Machine</h5>
The core scheduling engine leverages an exact time-matching system. Instead of matching generic date strings, the backend intercepts frontend payloads and hydration scripts to inject defaults dynamically.

[User Selects Dates] -> [Fetch Host Constraints] -> [Commit Unified DateTime Object]
                                                                │
                                              ┌─────────────────┴─────────────────┐
                                              ▼                                   ▼
                                   (Current Time >= In)               (Current Time >= Out)
                                              │                                   │
                                              ▼                                   ▼
                                      [Status: Checked In]               [Status: Completed]
<h5>2. Financial Processing & Host Payouts (backend/services/)</h5>
The platform uses a delayed disbursement pattern to protect consumers while ensuring consistent host revenue streams. The processing logic acts as a deterministic state evaluator:

Booking Status	Payment Status	Payout Status	System Action
pending / reserved	pending	pending	Skip (Awaiting fulfillment)
checked_in	completed	pending	Approve & Execute (Service Started)
completed	completed	pending	Approve & Execute (Service Rendered)
cancelled	refunded	void	Skip (Terminated)
3. Real-Time Communication & Authentication
WebSockets: Context-aware components handle real-time host/guest negotiation rooms (ChatScreen.js, ChatRoomsList.js).

Social Sign-On: Fully integrated Passport-based Google OAuth processing that seamless redirects production contexts back into security-vetted UI views.

📁 Key File Structure & Contributions
Below is a breakdown of the critical application directories showcasing core architectural contributions:

Code snippet
drivinn/
├── backend/
│   ├── config/
│   │   └── passport.js                 # Production-grade Google OAuth 2.0 configuration
│   ├── controllers/
│   │   ├── bookingsController.js       # Core scheduling processing & DateTime mutation logic
│   │   └── hostApplicationController.js# Stripe onboard onboarding redirects & webhooks
│   ├── models/
│   │   └── booking.js                  # Booking model with self-evaluating automated state methods
│   ├── services/
│   │   ├── delayedPayoutProcessor.js   # Automated merchant payout scheduler evaluation engine
│   │   └── emailService.js             # Contextual transaction-triggered mail layers
│   └── scripts/
│       ├── testTimeLogic.js            # Automated edge-case assessment for temporal states
│       └── testPayoutLogic.js          # Sandbox scripts simulating escrow fulfillment
└── frontend/
    └── src/
        ├── components/
        │   ├── ChatScreen.js           # Real-time WebSocket multi-user visual interface
        │   └── auth/
        │       └── SocialLoginSuccess.js# Interceptor checking OAuth JWT status vectors
        └── services/
            └── api.js                  # Encapsulated Axios module for production distribution
🔧 Production Verification & Testing
The system includes standalone test scripts to safely dry-run business state operations against actual data collections before live deployment runs.

Bash
# Verify system-wide temporal state modifications
cd backend
node scripts/testTimeLogic.js

# Evaluate ledger criteria for host payment disbursements
node scripts/testPayoutLogic.js

# Trigger manual invocation of the payout engine
node services/delayedPayoutProcessor.js
🌐 Deployment Details
The platform is fully decoupled and optimized for deployment across isolated cloud topologies:

Production API Gateway Host: https://drivinn.onrender.com (Deployed via Render)

Production Client Layer Host: https://driv-inn.vercel.app (Deployed via Vercel)

<img width="1850" height="4790" alt="Image" src="https://github.com/user-attachments/assets/b62f7760-cd01-4c48-bdd4-2298ab6b0e13" />
<img width="597" height="1280" alt="Image" src="https://github.com/user-attachments/assets/921bffc4-ed8a-4409-9f6c-ec3fb1c598c8" />
<img width="597" height="1280" alt="Image" src="https://github.com/user-attachments/assets/a18cce62-598c-487a-8db2-0541617eb6a3" />
<img width="319" height="1280" alt="Image" src="https://github.com/user-attachments/assets/1a8df205-638c-41d9-82b7-3ff760ae2b45" />
<img width="597" height="1280" alt="Image" src="https://github.com/user-attachments/assets/52d721ea-e5e5-4766-9ca9-1674f41ed1f2" />
<img width="328" height="1280" alt="Image" src="https://github.com/user-attachments/assets/99586620-382d-4368-af3f-3d95106ebac3" />
