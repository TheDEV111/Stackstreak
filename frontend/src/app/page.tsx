import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Coins, Shield, TrendingUp, Users, Lock } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="container flex flex-col items-center gap-8 py-24 md:py-32">
        <Badge variant="secondary" className="px-4 py-1">
          Built on Stacks Blockchain
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold text-center max-w-4xl leading-tight">
          Decentralized Content Monetization for Creators
        </h1>
        <p className="text-xl text-muted-foreground text-center max-w-2xl">
          StackStream empowers creators to monetize their content through subscriptions and
          micropayments, secured by Bitcoin through Stacks.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" asChild>
            <Link href="/dashboard">Start Creating</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/marketplace">Browse Creators</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="container py-24 border-t">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why StackStream?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built for creators who want true ownership and direct monetization
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 mb-4 text-primary" />
              <CardTitle>Instant Payments</CardTitle>
              <CardDescription>
                Receive micropayments instantly with no intermediaries or hidden fees
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 mb-4 text-primary" />
              <CardTitle>Blockchain Security</CardTitle>
              <CardDescription>
                All transactions secured by Bitcoin through the Stacks blockchain
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Coins className="h-10 w-10 mb-4 text-primary" />
              <CardTitle>Flexible Monetization</CardTitle>
              <CardDescription>
                Choose between subscriptions, pay-per-view, or bundle pricing models
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Users className="h-10 w-10 mb-4 text-primary" />
              <CardTitle>Direct Creator Support</CardTitle>
              <CardDescription>
                Fans support creators directly with 85% of revenue going to creators
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <TrendingUp className="h-10 w-10 mb-4 text-primary" />
              <CardTitle>Built-in Discovery</CardTitle>
              <CardDescription>
                Grow your audience with reputation scores and category-based discovery
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Lock className="h-10 w-10 mb-4 text-primary" />
              <CardTitle>True Ownership</CardTitle>
              <CardDescription>
                You own your content and your relationship with your audience
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Stats */}
      <section className="container py-24 border-t">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold mb-2">85%</div>
            <div className="text-muted-foreground">Creator Revenue Share</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">0.1 STX</div>
            <div className="text-muted-foreground">Minimum Content Price</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">3 Tiers</div>
            <div className="text-muted-foreground">Subscription Options</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-24 border-t">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="flex flex-col items-center gap-6 py-12">
            <h2 className="text-3xl md:text-4xl font-bold text-center">
              Ready to Start Earning?
            </h2>
            <p className="text-lg text-center max-w-2xl opacity-90">
              Join StackStream today and take control of your content monetization
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/dashboard">Get Started Now</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
