import { Metadata } from "next";
import { FadeIn } from "@/components/motion/fade-in";
import { PricingTable } from "@/features/billing/components/pricing-table";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing - Notes SaaS",
  description: "Simple, transparent pricing for everyone.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
             <ChevronLeft className="h-4 w-4 mr-1" /> Back to Home
          </Link>
          <FadeIn>
             <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Simple, transparent pricing
             </h1>
             <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Choose the plan that fits your workflow. All plans include 
                end-to-end encryption and offline support.
             </p>
          </FadeIn>
        </div>

        {/* Pricing Table */}
        <FadeIn delay={0.2}>
           <PricingTable />
        </FadeIn>
        
        {/* FAQ Section (Simplified) */}
        <FadeIn delay={0.4} className="max-w-3xl mx-auto pt-10 border-t">
           <h2 className="text-2xl font-semibold mb-6 text-center">Frequently Asked Questions</h2>
           <div className="grid gap-6 md:grid-cols-2">
              <div>
                 <h3 className="font-medium">Can I cancel anytime?</h3>
                 <p className="text-muted-foreground text-sm mt-1">Yes, you can cancel your subscription at any time via the dashboard. Access remains until the end of the billing period.</p>
              </div>
              <div>
                 <h3 className="font-medium">Is the Free plan really free?</h3>
                 <p className="text-muted-foreground text-sm mt-1">Yes, forever. It's perfect for personal note-taking with moderate AI usage.</p>
              </div>
           </div>
        </FadeIn>

      </div>
    </div>
  );
}
