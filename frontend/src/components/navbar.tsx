import Link from 'next/link';
import { WalletButton } from '@/components/wallet-button';
import { Zap } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Zap className="h-6 w-6 text-primary" />
            StackStream
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/marketplace"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Marketplace
            </Link>
            <Link
              href="/creators"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Creators
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
        <WalletButton />
      </div>
    </nav>
  );
}
