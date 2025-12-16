'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, CheckCircle2, TrendingUp, Users } from 'lucide-react';

// Mock data for demonstration
const mockCreators = [
  {
    address: 'SP2...ABC',
    username: 'techwriter',
    bio: 'Technology and programming tutorials',
    category: 'Technology',
    verified: true,
    reputation: 95,
    subscribers: 1234,
  },
  {
    address: 'SP3...DEF',
    username: 'artcreator',
    bio: 'Digital art and design',
    category: 'Art',
    verified: true,
    reputation: 88,
    subscribers: 892,
  },
  {
    address: 'SP4...GHI',
    username: 'musicpro',
    bio: 'Original music and beats',
    category: 'Music',
    verified: false,
    reputation: 72,
    subscribers: 456,
  },
];

const categories = ['All', 'Technology', 'Art', 'Music', 'Education', 'Gaming', 'Other'];

export default function MarketplacePage() {
  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Creator Marketplace</h1>
        <p className="text-muted-foreground">
          Discover and support talented creators on StackStream
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search creators by username or category..."
            className="pl-10"
          />
        </div>
        <Tabs defaultValue="All" className="w-full">
          <TabsList>
            {categories.map((cat) => (
              <TabsTrigger key={cat} value={cat}>
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Creators</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCreators.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Verified Creators</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockCreators.filter((c) => c.verified).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Reputation</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                mockCreators.reduce((acc, c) => acc + c.reputation, 0) /
                  mockCreators.length
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Creator Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockCreators.map((creator) => (
          <Card key={creator.address} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>{creator.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{creator.username}</CardTitle>
                      {creator.verified && (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                      {creator.address}
                    </p>
                  </div>
                </div>
              </div>
              <CardDescription className="mt-2">{creator.bio}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{creator.category}</Badge>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>{creator.reputation}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{creator.subscribers}</span>
                  </div>
                </div>
              </div>
              <Button className="w-full">View Profile</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {mockCreators.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No creators found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
