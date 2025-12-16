'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWallet } from '@/providers/wallet-provider';
import { useCreatorRegistry } from '@/hooks/use-creator-registry';
import { CheckCircle2, AlertCircle, User, FileText, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { isAuthenticated, userAddress } = useWallet();
  const { registerCreator, updateProfile, submitForVerification, isLoading } = useCreatorRegistry();
  
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [category, setCategory] = useState('');

  const handleRegister = async () => {
    try {
      await registerCreator(username, bio, avatarUrl, category);
      toast.success('Registration transaction submitted!');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    }
  };

  const handleUpdate = async () => {
    try {
      await updateProfile(bio, avatarUrl, category);
      toast.success('Profile update transaction submitted!');
    } catch (error) {
      toast.error('Update failed. Please try again.');
    }
  };

  const handleVerification = async () => {
    try {
      await submitForVerification();
      toast.success('Verification request submitted!');
    } catch (error) {
      toast.error('Verification submission failed. Please try again.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-24 flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Wallet Not Connected</h2>
        <p className="text-muted-foreground mb-6">
          Please connect your Stacks wallet to access the dashboard
        </p>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Creator Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your profile, content, and earnings
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-8">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="content">
            <FileText className="h-4 w-4 mr-2" />
            Content
          </TabsTrigger>
          <TabsTrigger value="earnings">
            <DollarSign className="h-4 w-4 mr-2" />
            Earnings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Creator Registration</CardTitle>
              <CardDescription>
                Register as a creator to start monetizing your content (5 STX fee)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input
                  placeholder="mycreator"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Bio</label>
                <Textarea
                  placeholder="Tell your audience about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Avatar URL</label>
                <Input
                  placeholder="https://..."
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Input
                  placeholder="e.g., Technology, Art, Music"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
              <Button onClick={handleRegister} disabled={isLoading} className="w-full">
                {isLoading ? 'Processing...' : 'Register as Creator'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Update Profile</CardTitle>
              <CardDescription>
                Update your creator profile (0.5 STX fee)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Bio</label>
                <Textarea
                  placeholder="Updated bio..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Avatar URL</label>
                <Input
                  placeholder="https://..."
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Input
                  placeholder="e.g., Technology, Art, Music"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
              <Button onClick={handleUpdate} disabled={isLoading} className="w-full">
                {isLoading ? 'Processing...' : 'Update Profile'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Verification</CardTitle>
              <CardDescription>
                Get verified with a badge (10 STX refundable stake)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4 p-4 border rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Verification Benefits</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Verified badge on your profile</li>
                    <li>• Higher visibility in marketplace</li>
                    <li>• Build trust with your audience</li>
                    <li>• 10 STX stake (refundable)</li>
                  </ul>
                </div>
              </div>
              <Button onClick={handleVerification} disabled={isLoading} className="w-full">
                {isLoading ? 'Processing...' : 'Submit for Verification'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Content Management</CardTitle>
              <CardDescription>
                Upload and manage your monetized content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Content management coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0 STX</div>
                <p className="text-xs text-muted-foreground mt-1">All-time revenue</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0</div>
                <p className="text-xs text-muted-foreground mt-1">Active subscriptions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Content Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0</div>
                <p className="text-xs text-muted-foreground mt-1">Total purchases</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
