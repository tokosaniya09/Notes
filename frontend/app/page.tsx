import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/fade-in";
import { ArrowRight, Layout, Zap, Lock } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="container z-40 bg-background/50 backdrop-blur-xl border-b border-border sticky top-0">
        <div className="flex h-16 items-center justify-between py-4">
          <div className="flex gap-2 font-bold text-xl items-center">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
              N
            </div>
            Notes SaaS
          </div>
          <nav className="flex gap-4 sm:gap-6">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-24 text-center">
        <div className="relative flex place-items-center my-16">
          <FadeIn>
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-7xl">
              Think clearer. <br />
              <span className="text-muted-foreground">Write faster.</span>
            </h1>
            <p className="leading-7 [&:not(:first-child)]:mt-6 max-w-lg mx-auto text-muted-foreground text-lg">
              An elegant, offline-first workspace designed for focus. 
              No clutter. Just you and your ideas.
            </p>
            <div className="mt-8 flex gap-4 justify-center">
              <Link href="/register">
                <Button size="lg">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                View Roadmap
              </Button>
            </div>
          </FadeIn>
        </div>

        <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-3 lg:text-left gap-8">
          <FeatureCard 
            icon={<Zap className="h-6 w-6" />}
            title="Instant Sync"
            description="Real-time synchronization across all your devices using CRDTs."
            delay={0.2}
          />
           <FeatureCard 
            icon={<Layout className="h-6 w-6" />}
            title="Minimal UI"
            description="A distraction-free interface that adapts to your workflow."
            delay={0.4}
          />
           <FeatureCard 
            icon={<Lock className="h-6 w-6" />}
            title="Encrypted"
            description="End-to-end encryption ensures your thoughts remain yours."
            delay={0.6}
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) {
  return (
    <FadeIn delay={delay} className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-border hover:bg-muted/50">
      <div className="mb-3 inline-block rounded-lg bg-muted p-2 text-foreground">
        {icon}
      </div>
      <h2 className="mb-3 text-2xl font-semibold">
        {title}
      </h2>
      <p className="m-0 max-w-[30ch] text-sm opacity-50">
        {description}
      </p>
    </FadeIn>
  )
}