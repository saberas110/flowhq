import { ArrowRight, CheckCircle, MessageSquare, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface HeroSectionProps {
  onStartTrial?: () => void;
  onWatchDemo?: () => void;
}

export default function HeroSection({
  onStartTrial,
  onWatchDemo,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden py-16 md:py-24 lg:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background" />
      
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl text-center">
          {/* Badge */}
          <div className="mb-6 flex justify-center">
            <Badge variant="secondary" className="gap-1.5 px-4 py-2">
              <Sparkles className="size-3.5" />
              <span className="text-xs font-medium">AI-Powered Customer Engagement</span>
            </Badge>
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Scale Customer Relationships{' '}
            <span className="text-primary">Without Scaling Your Team</span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mb-10 max-w-3xl text-base text-muted-foreground sm:text-lg md:text-xl">
            flowHQ autonomously manages customer conversations across chat, email, voice, 
            and social — pulling from your real business data to engage, support, and 
            sell like a human team member.
          </p>

          {/* CTA Buttons */}
          <div className="mb-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" onClick={onStartTrial} className="w-full sm:w-auto">
              Start Free Trial
              <ArrowRight />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={onWatchDemo}
              className="w-full sm:w-auto"
            >
              Watch Demo
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Free 10 conversations</span>
            <span className="hidden sm:inline">•</span>
            <span>No credit card required</span>
            <span className="hidden sm:inline">•</span>
            <span>Live in 30 minutes</span>
          </div>
        </div>

        {/* Floating notification cards */}
        <div className="relative mx-auto mt-16 hidden lg:block">
          <Card className="absolute -left-20 top-0 w-80 animate-pulse shadow-lg">
            <div className="flex items-start gap-3 p-4">
              <div className="rounded-lg bg-primary/10 p-2">
                <MessageSquare className="size-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">New message from Sarah</p>
                <p className="text-xs text-muted-foreground">
                  &ldquo;When can I expect delivery?&rdquo;
                </p>
              </div>
            </div>
          </Card>

          <Card className="absolute -right-20 top-12 w-80 animate-pulse shadow-lg delay-1000">
            <div className="flex items-start gap-3 p-4">
              <div className="rounded-lg bg-green-500/10 p-2">
                <CheckCircle className="size-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Order #1234 updated</p>
                <p className="text-xs text-muted-foreground">
                  Automatically handled by flowHQ
                </p>
              </div>
            </div>
          </Card>

          <Card className="absolute -left-32 bottom-0 w-72 animate-pulse shadow-lg delay-500">
            <div className="flex items-start gap-3 p-4">
              <div className="rounded-lg bg-secondary/10 p-2">
                <Zap className="size-5 text-secondary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Response sent</p>
                <p className="text-xs text-muted-foreground">
                  Average response time: 0.8s
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
