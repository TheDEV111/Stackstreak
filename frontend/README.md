# StackStream Frontend

Modern Next.js frontend for the StackStream decentralized content monetization platform.

## Features

- 🔐 **Stacks Wallet Integration** - Connect with Hiro Wallet or Xverse
- 💳 **Smart Contract Interactions** - Direct integration with deployed contracts
- 🎨 **Modern UI** - Built with shadcn/ui and Tailwind CSS v4
- ⚡ **Fast & Responsive** - Optimized with Next.js 15 App Router
- �� **Blockchain Connected** - Live data from Stacks mainnet

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui, lucide-react
- **Blockchain**: @stacks/connect, @stacks/transactions
- **Animations**: framer-motion

## Getting Started

### Prerequisites

- Node.js 18+ 
- A Stacks wallet (Hiro Wallet or Xverse)
- STX tokens for transactions

### Installation

```bash
cd frontend
npm install
```

### Environment Setup

Create `.env.local` file:

```env
NEXT_PUBLIC_NETWORK=mainnet
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Smart Contracts

Mainnet contracts:
- Creator Registry: `SPVQ61FEWR6M4HVAT3BNE07D4BNW6A1C2ACCNQ6F.creator-registry`
- Subscription Manager: `SPVQ61FEWR6M4HVAT3BNE07D4BNW6A1C2ACCNQ6F.subscription-manager`
- Micropayment Gateway: `SPVQ61FEWR6M4HVAT3BNE07D4BNW6A1C2ACCNQ6F.micropayment-gateway`

## License

MIT
