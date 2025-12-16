# StackStream - Decentralized Content Monetization Platform

A comprehensive blockchain-based platform built on Stacks that enables creators to monetize content through micropayments, subscriptions, and exclusive access gates using Clarity smart contracts.

## Overview

StackStream consists of three interconnected smart contracts that provide a complete content monetization ecosystem:

1. **Creator Registry Contract** - Manages creator profiles, verification, and content metadata
2. **Subscription Manager Contract** - Handles recurring subscriptions with automated billing
3. **Micropayment Gateway Contract** - Facilitates instant pay-per-view content access

## Smart Contracts

### 1. Creator Registry (`creator-registry.clar`)

**Purpose**: Manages creator profiles, verification status, and content metadata.

**Key Features**:
- Creator registration with profile NFTs
- Identity verification with stake (10 STX, refundable)
- Content metadata storage with efficient data structures
- Reputation scoring system
- Platform fee: 0.5% on registration (minimum 5 STX)

**Main Functions**:
```clarity
;; Registration & Profile
(register-creator (username (string-ascii 50)) (bio (string-utf8 500)) (profile-image-url (string-utf8 256)))
(update-profile (bio (string-utf8 500)) (profile-image-url (string-utf8 256)))

;; Verification
(verify-identity) ;; Stakes 10 STX
(refund-verification-stake) ;; Refunds stake

;; Content Management
(add-content (title (string-utf8 200)) (description (string-utf8 1000)) (content-hash (buff 32)) (price uint))
(toggle-content-status (content-id uint))
(record-content-access (creator principal) (content-id uint) (revenue-amount uint))

;; Read-Only
(get-creator (creator principal))
(get-creator-by-username (username (string-ascii 50)))
(get-content-metadata (creator principal) (content-id uint))
(get-total-creators)
```

**Fees**:
- Registration: 5 STX
- Profile update: 0.5 STX
- Verification stake: 10 STX (refundable)

### 2. Subscription Manager (`subscription-manager.clar`)

**Purpose**: Handles recurring subscriptions with automated billing cycles.

**Key Features**:
- Tiered subscription models (Basic: 5-25 STX, Premium: 25-50 STX, VIP: 50-100 STX)
- Automatic renewal with grace periods (~1 day)
- Revenue split: 85% creator, 10% platform, 5% referrers
- Subscription management (upgrade, cancel, auto-renew)

**Main Functions**:
```clarity
;; Tier Management
(create-subscription-tier (tier-name (string-ascii 20)) (monthly-price uint) (benefits (string-utf8 500)) (max-subscribers uint))

;; Subscription Management
(subscribe (creator principal) (tier-name (string-ascii 20)) (referred-by (optional principal)))
(renew-subscription (creator principal))
(cancel-subscription (creator principal))
(upgrade-subscription (creator principal) (new-tier-name (string-ascii 20)))
(toggle-auto-renew (creator principal))

;; Access Control
(check-subscription-access (subscriber principal) (creator principal))

;; Read-Only
(get-subscription-tier (creator principal) (tier-name (string-ascii 20)))
(get-subscription (subscriber principal) (creator principal))
(get-creator-stats (creator principal))
(is-subscription-active (subscriber principal) (creator principal))
```

**Fees**:
- Platform fee: 10% of subscription revenue
- Referrer commission: 5% of subscription revenue
- Tier upgrade fee: 2 STX
- Early cancellation penalty: 20% of remaining value

### 3. Micropayment Gateway (`micropayment-gateway.clar`)

**Purpose**: Facilitates instant pay-per-view content access with minimal friction.

**Key Features**:
- Lightning-fast micropayments (0.1-10 STX)
- Time-limited content access tokens (~24 hours)
- Batch payment processing with 10% discount (10+ items)
- Content gifting system
- Platform fee: 5% on transactions (minimum 0.05 STX)

**Main Functions**:
```clarity
;; Purchases
(purchase-content (creator principal) (content-id uint) (price uint))
(purchase-batch (creator principal) (content-ids (list 10 uint)) (total-price uint))

;; Bundles
(create-bundle (content-ids (list 10 uint)) (bundle-price uint) (discount-percent uint))
(purchase-bundle (creator principal) (bundle-id uint))

;; Gifting
(gift-content (recipient principal) (creator principal) (content-id uint) (price uint))
(claim-gift (gifter principal) (gift-id uint))

;; Access Management
(verify-access (token-id uint))
(revoke-access (token-id uint))

;; Read-Only
(get-access-token (token-id uint))
(has-valid-access (purchaser principal) (creator principal) (content-id uint))
(get-total-transactions)
(get-total-volume)
```

**Fees**:
- Transaction fee: 5% (minimum 0.05 STX)
- Content unlock: 0.1-10 STX per item
- Batch discount: 10% off for 10+ items

## Revenue Model

### Target Metrics (Year 1)
- **Creators**: 10,000
- **Subscribers**: 100,000
- **Monthly Active Users**: 50,000

### Projected Annual Revenue
```
Registration fees:         50,000 STX (10,000 creators × 5 STX)
Subscription platform fees: 1,020,000 STX (100k subs × 10 STX/mo × 10% × 12)
Micropayment fees:         300,000 STX (6M transactions × 1 STX avg × 5%)
───────────────────────────────────────────────────────────────
Total Annual Revenue:      ~1,370,000 STX
```

## Technical Stack

- **Blockchain**: Stacks 2.5+
- **Smart Contract Language**: Clarity (Language Version 2)
- **Development Tools**: Clarinet
- **Testing Framework**: Vitest with @hirosystems/clarinet-sdk
- **Wallet Integration**: Hiro Wallet, Xverse

## Installation & Setup

### Prerequisites
- [Clarinet](https://github.com/hirosystems/clarinet) installed
- Node.js 18+ and npm

### Clone and Install
```bash
git clone <repository-url>
cd stackstreak

# Install dependencies
npm install

# Check contracts
clarinet check

# Run tests
npm test
```

## Testing

The project includes comprehensive test suites for all three contracts:

```bash
# Run all tests
npm test

# Run specific contract tests
npm test creator-registry
npm test subscription-manager
npm test micropayment-gateway
```

### Test Coverage

**Creator Registry Tests**:
- ✅ Creator registration with validation
- ✅ Profile management and updates
- ✅ Verification system with staking
- ✅ Content metadata management
- ✅ Reputation scoring
- ✅ NFT badge minting

**Subscription Manager Tests**:
- ✅ Tier creation (Basic, Premium, VIP)
- ✅ Subscription lifecycle (subscribe, renew, cancel)
- ✅ Referral tracking and earnings
- ✅ Tier upgrades and downgrades
- ✅ Auto-renewal management
- ✅ Access control checks

**Micropayment Gateway Tests**:
- ✅ Single content purchases
- ✅ Batch purchases with discounts
- ✅ Content bundle creation and purchasing
- ✅ Gifting system
- ✅ Access token management
- ✅ Revenue distribution

## Contract Deployment

### Testnet Deployment
```bash
# Deploy to testnet
clarinet integrate

# Deploy specific contract
clarinet deployments generate --testnet
clarinet deployments apply -p <plan-file>
```

### Mainnet Deployment
```bash
# Generate deployment plan
clarinet deployments generate --mainnet

# Review and apply
clarinet deployments apply -p deployments/mainnet.yaml
```

## Usage Examples

### For Creators

**Register as Creator**:
```clarity
(contract-call? .creator-registry register-creator 
    "my-username" 
    "I create amazing content" 
    "https://example.com/avatar.jpg")
```

**Add Content**:
```clarity
(contract-call? .creator-registry add-content 
    "My First Video" 
    "An amazing tutorial" 
    0x1234... 
    u1000000) ;; 1 STX
```

**Create Subscription Tier**:
```clarity
(contract-call? .subscription-manager create-subscription-tier 
    "premium" 
    u30000000  ;; 30 STX/month
    "Access to all premium content" 
    u500)      ;; Max 500 subscribers
```

### For Users

**Subscribe to Creator**:
```clarity
(contract-call? .subscription-manager subscribe 
    'ST1CREATOR... 
    "premium" 
    none)  ;; No referrer
```

**Purchase Content**:
```clarity
(contract-call? .micropayment-gateway purchase-content 
    'ST1CREATOR... 
    u1         ;; content-id
    u1000000)  ;; 1 STX
```

**Gift Content**:
```clarity
(contract-call? .micropayment-gateway gift-content 
    'ST1FRIEND... 
    'ST1CREATOR... 
    u1 
    u1000000)
```

## Security Features

- ✅ Input validation on all public functions
- ✅ Authorization checks (tx-sender verification)
- ✅ Safe math operations (no overflow)
- ✅ Reentrancy protection through Clarity design
- ✅ Access control for admin functions
- ✅ Token expiration for time-limited access
- ✅ Secure payment distribution

## Success Metrics

### Platform KPIs
- Creator retention rate: > 70%
- Average subscriber lifetime value: > 500 STX
- Transaction success rate: > 99%
- Platform fee revenue growth: 15% MoM

### Creator Metrics
- Average monthly earnings per creator
- Content engagement rate
- Subscription conversion rate
- Retention rate by tier

## Roadmap

### Phase 1 (Current)
- ✅ Core smart contract implementation
- ✅ Comprehensive testing suite
- ✅ Clarinet check compliance

### Phase 2 (Q1 2024)
- [ ] Frontend application (React + Stacks.js)
- [ ] Wallet integration (Hiro, Xverse)
- [ ] Creator dashboard
- [ ] User marketplace

### Phase 3 (Q2 2024)
- [ ] Mobile applications
- [ ] Advanced analytics
- [ ] Creator tools and APIs
- [ ] Enhanced discovery features

### Phase 4 (Q3 2024)
- [ ] Cross-chain bridges
- [ ] Governance token
- [ ] DAO implementation
- [ ] Advanced monetization features

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass (`npm test`)
5. Run Clarinet check (`clarinet check`)
6. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

- Documentation: [docs.stackstream.io](https://docs.stackstream.io)
- Discord: [discord.gg/stackstream](https://discord.gg/stackstream)
- Twitter: [@StackStream](https://twitter.com/stackstream)
- Email: support@stackstream.io

## Acknowledgments

Built with ❤️ using:
- [Stacks Blockchain](https://www.stacks.co/)
- [Clarity Language](https://clarity-lang.org/)
- [Clarinet](https://github.com/hirosystems/clarinet)
- [Hiro Platform](https://www.hiro.so/)

---

**Disclaimer**: This smart contract system is provided as-is. Please conduct thorough audits before mainnet deployment.
