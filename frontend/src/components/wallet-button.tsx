'use client';

import { Button } from '@/components/ui/button';
import { useWallet } from '@/providers/wallet-provider';
import { Wallet, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function WalletButton() {
  const { isAuthenticated, userAddress, connect, disconnect } = useWallet();

  if (!isAuthenticated) {
    return (
      <Button onClick={connect} className="gap-2">
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  const shortAddress = userAddress
    ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`
    : '';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback>{userAddress?.[0] || '?'}</AvatarFallback>
          </Avatar>
          {shortAddress}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="font-mono text-xs">
          {userAddress}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={disconnect} className="gap-2 text-destructive">
          <LogOut className="h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
