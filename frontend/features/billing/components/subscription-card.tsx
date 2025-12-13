"use client";

import { usePortal, useSubscription } from "../hooks";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import { format } from "date-fns";
import { CreditCard, Zap, HardDrive, Users } from "lucide-react";

export function SubscriptionCard() {
  const { data, isLoading } = useSubscription();
  const { mutate: openPortal, isPending: isPortalLoading } = usePortal();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 w-32 bg-muted animate-pulse rounded" />
          <div className="h-4 w-48 bg-muted animate-pulse rounded mt-2" />
        </CardHeader>
        <CardContent>
           <div className="space-y-2">
             <div className="h-4 w-full bg-muted animate-pulse rounded" />
             <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
           </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const { subscription, entitlements } = data;
  const isFree = subscription.tier === 'FREE';

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30 pb-8">
        <div className="flex items-center justify-between">
            <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                    Current Plan: {subscription.tier}
                    {subscription.status === 'active' && <Badge variant="success">Active</Badge>}
                    {subscription.status === 'canceled' && <Badge variant="destructive">Canceled</Badge>}
                </CardTitle>
                <CardDescription>
                    {isFree 
                        ? "Upgrade to unlock advanced features." 
                        : `Your plan renews on ${subscription.endsAt ? format(new Date(subscription.endsAt), 'PPP') : '...'}`
                    }
                </CardDescription>
            </div>
            <div className="bg-background p-3 rounded-full border">
                <CreditCard className="h-6 w-6 text-muted-foreground" />
            </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 grid gap-6">
         <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col gap-2 p-4 border rounded-lg">
               <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Zap className="h-4 w-4" /> AI Limit
               </div>
               <div className="font-semibold text-2xl">
                  {entitlements.features.aiRequestLimitPerDay} <span className="text-sm font-normal text-muted-foreground">/ day</span>
               </div>
            </div>
            
            <div className="flex flex-col gap-2 p-4 border rounded-lg">
               <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <HardDrive className="h-4 w-4" /> Storage
               </div>
               <div className="font-semibold text-2xl">
                  {Math.round(entitlements.features.maxStorageBytes / (1024*1024))} <span className="text-sm font-normal text-muted-foreground">MB</span>
               </div>
            </div>

            <div className="flex flex-col gap-2 p-4 border rounded-lg">
               <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Users className="h-4 w-4" /> Collaboration
               </div>
               <div className="font-semibold text-lg">
                  {entitlements.features.canUseCollaboration ? "Included" : "Not Included"}
               </div>
            </div>
         </div>
      </CardContent>

      <CardFooter className="bg-muted/30 py-4 flex justify-between items-center">
         <p className="text-xs text-muted-foreground">
            Billing managed via Stripe Secure Portal.
         </p>
         {!isFree && (
            <Button variant="outline" size="sm" onClick={() => openPortal()} disabled={isPortalLoading}>
                {isPortalLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                Manage Subscription
            </Button>
         )}
      </CardFooter>
    </Card>
  );
}
