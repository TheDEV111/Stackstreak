# StackStream Contract Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        StackStream Platform                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐ │
│  │  Creator Registry│  │Subscription Mgr  │  │ Micropayment  │ │
│  │                  │  │                  │  │   Gateway     │ │
│  │ • Profiles       │  │ • Tiers          │  │ • Pay-per-view│ │
│  │ • Verification   │  │ • Subscriptions  │  │ • Bundles     │ │
│  │ • Content Meta   │  │ • Renewals       │  │ • Gifts       │ │
│  │ • Reputation     │  │ • Revenue Split  │  │ • Tokens      │ │
│  │ • NFT Badges     │  │ • Access Control │  │ • Batch Buys  │ │
│  └──────────────────┘  └──────────────────┘  └───────────────┘ │
│           │                     │                      │         │
│           └─────────────────────┴──────────────────────┘         │
│                                 │                                │
│                        ┌────────▼────────┐                       │
│                        │  Platform       │                       │
│                        │  Treasury       │                       │
│                        │  (STX Vault)    │                       │
│                        └─────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
```

## Contract Interactions

### Creator Onboarding Flow
```
User → register-creator() → Creator Registry
  ├─ Pay 5 STX registration fee
  ├─ Create profile
  ├─ Generate username mapping
  └─ Initialize reputation (100 points)

Creator → verify-identity() → Creator Registry
  ├─ Stake 10 STX
  ├─ Mark as verified
  ├─ Mint NFT badge
  └─ Bonus reputation (+500 points)
```

### Subscription Flow
```
Creator → create-subscription-tier() → Subscription Manager
  ├─ Define tier (Basic/Premium/VIP)
  ├─ Set monthly price
  ├─ Set max subscribers
  └─ Activate tier

User → subscribe() → Subscription Manager
  ├─ Pay subscription price
  ├─ Distribute payment:
  │   ├─ 85% to Creator
  │   ├─ 10% to Platform
  │   └─ 5% to Referrer (if any)
  ├─ Create subscription record
  ├─ Set renewal date (+ 4320 blocks ≈ 30 days)
  └─ Update creator stats

User → renew-subscription() → Subscription Manager
  ├─ Check if due for renewal
  ├─ Allow grace period (144 blocks ≈ 1 day)
  ├─ Process payment
  └─ Update next payment date

User → cancel-subscription() → Subscription Manager
  ├─ Check if early cancellation
  ├─ Charge 20% penalty if early
  └─ Deactivate subscription
```

### Content Purchase Flow
```
Creator → add-content() → Creator Registry
  ├─ Store metadata
  ├─ Set content price
  ├─ Generate content ID
  └─ Add reputation (+10 points)

User → purchase-content() → Micropayment Gateway
  ├─ Validate price range (0.1-10 STX)
  ├─ Process payment:
  │   ├─ 95% to Creator
  │   └─ 5% to Platform (min 0.05 STX)
  ├─ Generate access token
  ├─ Set expiry (+ 144 blocks ≈ 24 hours)
  ├─ Record transaction
  └─ Call record-content-access() → Creator Registry
      ├─ Update access count
      ├─ Update revenue
      └─ Add reputation (+5 points)

User → verify-access() → Micropayment Gateway
  ├─ Check token validity
  ├─ Check expiration
  └─ Return access status
```

### Batch Purchase Flow
```
User → purchase-batch() → Micropayment Gateway
  ├─ Validate content list (1-10 items)
  ├─ Calculate discount (10% if ≥10 items)
  ├─ Process discounted payment
  ├─ Record batch transaction
  └─ Update creator stats

Creator → create-bundle() → Micropayment Gateway
  ├─ Define content IDs (2+ items)
  ├─ Set bundle price
  ├─ Set discount (max 50%)
  └─ Activate bundle

User → purchase-bundle() → Micropayment Gateway
  └─ Call purchase-batch() with bundle details
```

### Gifting Flow
```
User → gift-content() → Micropayment Gateway
  ├─ Validate recipient ≠ sender
  ├─ Process payment to creator
  ├─ Create gift record
  └─ Generate gift ID

Recipient → claim-gift() → Micropayment Gateway
  ├─ Verify gift exists
  ├─ Check not claimed
  ├─ Generate access token for recipient
  └─ Mark gift as claimed
```

## Data Models

### Creator Profile
```clarity
{
  username: string-ascii 50,
  bio: string-utf8 500,
  profile-image-url: string-utf8 256,
  is-verified: bool,
  reputation-score: uint,
  total-content: uint,
  total-revenue: uint,
  registered-at: uint,
  verification-stake: uint
}
```

### Content Metadata
```clarity
{
  title: string-utf8 200,
  description: string-utf8 1000,
  content-hash: buff 32,
  price: uint,
  access-count: uint,
  revenue: uint,
  created-at: uint,
  is-active: bool
}
```

### Subscription
```clarity
{
  tier-name: string-ascii 20,
  monthly-price: uint,
  start-block: uint,
  last-payment-block: uint,
  next-payment-block: uint,
  auto-renew: bool,
  referred-by: optional principal,
  total-paid: uint,
  is-active: bool
}
```

### Access Token
```clarity
{
  purchaser: principal,
  creator: principal,
  content-id: uint,
  purchase-block: uint,
  expiry-block: uint,
  amount-paid: uint,
  is-active: bool,
  access-key: buff 32
}
```

## Revenue Distribution

### Subscription Revenue Split
```
Monthly Subscription: 30 STX
├─ Creator (85%):     25.5 STX
├─ Platform (10%):    3.0 STX
└─ Referrer (5%):     1.5 STX
```

### Micropayment Revenue Split
```
Content Purchase: 1 STX
├─ Creator (95%):     0.95 STX
└─ Platform (5%):     0.05 STX
```

### Batch Purchase with Discount
```
10 Items × 1 STX = 10 STX
Batch Discount (10%): -1 STX
Final Price: 9 STX
├─ Creator (95%):     8.55 STX
└─ Platform (5%):     0.45 STX
```

## Fee Schedule

| Action | Fee | Recipient |
|--------|-----|-----------|
| Creator Registration | 5 STX | Platform |
| Profile Update | 0.5 STX | Platform |
| Verification Stake | 10 STX | Platform (refundable) |
| Subscription (Platform Fee) | 10% | Platform |
| Subscription (Referrer) | 5% | Referrer |
| Tier Upgrade | 2 STX | Platform |
| Early Cancellation | 20% of remaining | Platform |
| Micropayment | 5% (min 0.05 STX) | Platform |
| Batch Discount | -10% (≥10 items) | User benefit |

## Security Considerations

### Input Validation
- ✅ Username length (3-50 characters)
- ✅ Price ranges validated
- ✅ Tier price ranges by level
- ✅ Content list size limits
- ✅ Discount percentage limits

### Authorization Checks
- ✅ Creator-only functions (add-content, create-tier)
- ✅ Owner-only functions (set-treasury, adjust-reputation)
- ✅ Subscriber-only functions (renew, cancel)
- ✅ Access token verification

### State Management
- ✅ Atomic operations
- ✅ No reentrancy vulnerabilities
- ✅ Safe integer arithmetic
- ✅ Proper error handling

### Access Control
- ✅ Token expiration checks
- ✅ Subscription grace periods
- ✅ Creator verification status
- ✅ Content activation status

## Gas Optimization

### Efficient Data Structures
- Maps for O(1) lookups
- Counters for sequential IDs
- Minimal storage per record

### Batch Operations
- Single transaction for multiple items
- Reduced function call overhead
- Optimized payment distribution

## Upgrade Path

The contracts are designed to be immutable for security, but can be upgraded through:

1. **Proxy Pattern**: Deploy new versions and update references
2. **Migration Contract**: Transfer data to new contract versions
3. **Feature Flags**: Enable/disable features via admin functions

## Monitoring & Analytics

### Key Metrics to Track
- Total creators registered
- Active subscriptions count
- Transaction volume
- Revenue by contract
- Reputation distribution
- Content access patterns

### Events to Monitor
- New creator registrations
- Subscription changes
- Content purchases
- Verification status changes
- Platform fee collection

## Disaster Recovery

### Backup Strategies
- Off-chain metadata backup
- Transaction history indexing
- State snapshots
- Recovery procedures

### Emergency Functions
- Platform treasury management
- Tier deactivation
- Bundle deactivation
- Access token revocation

---

## Contract Addresses (Testnet)

```
Creator Registry:      ST1...TBD
Subscription Manager:  ST1...TBD
Micropayment Gateway:  ST1...TBD
```

## Contract Addresses (Mainnet)

```
Creator Registry:      SP1...TBD
Subscription Manager:  SP1...TBD
Micropayment Gateway:  SP1...TBD
```

---

**Last Updated**: December 2025
**Clarity Version**: 2.0
**Stacks Version**: 2.5+
