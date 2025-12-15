"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCheckout, useSubscription } from "../hooks";
import { SubscriptionTier } from "../types";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const PLANS = [
  {
    tier: SubscriptionTier.FREE,
    name: "Free",
    price: "$0",
    description: "For personal use and exploration.",
    features: ["5 AI requests / day", "100MB Storage", "Basic Collaboration", "Community Support"],
  },
  {
    tier: SubscriptionTier.PRO,
    name: "Pro",
    price: "$12",
    period: "/mo",
    description: "For power users who need clarity.",
    recommended: true,
    features: ["100 AI requests / day", "10GB Storage", "Advanced AI Models", "Priority Support", "Version History"],
  },
  {
    tier: SubscriptionTier.TEAM,
    name: "Team",
    price: "$49",
    period: "/mo",
    description: "For teams building together.",
    features: ["Unlimited AI", "100GB Storage", "Team Management", "SSO (Coming Soon)", "Dedicated Success Manager"],
  },
];

export function PricingTable() {
  const { data: session } = useSession();
  const router = useRouter();
  const { data: subscription, isLoading } = useSubscription();
  const { mutate: checkout, isPending } = useCheckout();
  const [processingTier, setProcessingTier] = useState<SubscriptionTier | null>(null);

  const handleAction = (tier: SubscriptionTier) => {
    if (!session) {
      router.push("/register?from=/pricing");
      return;
    }

    if (subscription?.subscription.tier === tier) {
      router.push("/dashboard/billing");
      return;
    }

    setProcessingTier(tier);

    checkout(
      {
        tier,
        successUrl: `${window.location.origin}/dashboard/billing?success=true`,
        cancelUrl: `${window.location.origin}/pricing?canceled=true`,
      },
      {
        onSettled: () => {
          setProcessingTier(null);
        },
      }
    );
  };


  return (
    <div className="grid gap-8 lg:grid-cols-3 lg:gap-8">
      {PLANS.map((plan) => {
        const isCurrent = subscription?.subscription.tier === plan.tier;
        const isProcessing = processingTier === plan.tier;

        return (
          <Card 
            key={plan.tier} 
            className={cn(
               "relative flex flex-col",
               plan.recommended && "border-primary shadow-lg scale-105 z-10"
            )}
          >
            {plan.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="px-3 py-1">Recommended</Badge>
                </div>
            )}
            
            <CardHeader>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="mt-2 flex items-baseline gap-1">
                 <span className="text-4xl font-bold">{plan.price}</span>
                 {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="flex-1">
               <ul className="space-y-3">
                  {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                      </li>
                  ))}
               </ul>
            </CardContent>
            
            <CardFooter>
              <Button 
                className="w-full" 
                variant={plan.recommended ? "default" : "outline"}
                disabled={
                  isCurrent ||
                  (plan.tier === SubscriptionTier.FREE && !!session) ||
                  isProcessing
                }
                onClick={() => handleAction(plan.tier)}
              >
                {isProcessing ? (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : isCurrent ? (
                  "Current Plan"
                ) : !session ? (
                  "Get Started"
                ) : plan.tier === SubscriptionTier.FREE ? (
                  "Downgrade"
                ) : (
                  "Upgrade"
                )}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
