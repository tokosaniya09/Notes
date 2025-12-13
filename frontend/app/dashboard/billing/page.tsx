import { Metadata } from "next";
import { FadeIn } from "@/components/motion/fade-in";
import { SubscriptionCard } from "@/features/billing/components/subscription-card";
import { PricingTable } from "@/features/billing/components/pricing-table";

export const metadata: Metadata = {
  title: "Billing & Subscription",
  description: "Manage your subscription plan.",
};

export default function BillingPage() {
  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <FadeIn>
         <div className="flex items-center justify-between space-y-2">
            <div>
               <h2 className="text-3xl font-bold tracking-tight">Billing</h2>
               <p className="text-muted-foreground">
                  Manage your subscription, payment methods, and entitlements.
               </p>
            </div>
         </div>
      </FadeIn>

      <div className="space-y-8">
         <FadeIn delay={0.1}>
            <SubscriptionCard />
         </FadeIn>
         
         <div className="space-y-4">
            <h3 className="text-xl font-semibold tracking-tight">Available Plans</h3>
            <FadeIn delay={0.2}>
               <PricingTable />
            </FadeIn>
         </div>
      </div>
    </div>
  );
}
