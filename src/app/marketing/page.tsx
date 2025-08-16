
'use client';
import Image from 'next/image';
import {
  Landmark,
  Check,
  ChartLine,
  Facebook,
  FileText,
  Instagram,
  Lightbulb,
  Lock,
  Mic,
  PiggyBank,
  Receipt,
  ShieldCheck,
  Twitter,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Logo Component
const Logo = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-6 text-mk-accent">
    <path
      d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z"
      fill="currentColor"
    ></path>
  </svg>
);


// Header Component
const MarketingHeader = () => {
  const navItems = [
    { name: 'Features', href: '#features' },
    { name: 'Demo', href: '#demo' },
    { name: 'Pricing', href: '#pricing' },
  ];
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-mk-secondary bg-mk-bg-1/80 px-4 py-3 backdrop-blur-sm sm:px-10">
        <Link href="/marketing" className="flex items-center gap-3 text-white">
            <Logo />
            <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">Finwise AI</h2>
        </Link>
        <nav className="hidden items-center gap-9 md:flex">
            {navItems.map(item => (
                <a key={item.name} href={item.href} className="text-sm font-medium leading-normal text-mk-text hover:text-white">
                    {item.name}
                </a>
            ))}
        </nav>
        <div className="flex items-center gap-2">
            <Button asChild className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-mk-accent text-mk-bg-1 text-sm font-bold leading-normal tracking-[0.015em] transition-colors hover:bg-mk-accent/90">
                <Link href="/entry">Get Started</Link>
            </Button>
        </div>
    </header>
  );
};


// Hero Component
const HeroSection = () => {
  return (
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
          <div
              className="flex min-h-[480px] flex-col items-center justify-center gap-8 rounded-xl bg-cover bg-center p-4 text-center"
              style={{
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2511&auto=format&fit=crop')`,
              }}
              data-ai-hint="finance analytics"
          >
              <div className="flex flex-col gap-4">
                  <h1 className="text-4xl font-black leading-tight tracking-tighter text-white sm:text-6xl">
                      Unlock Financial Clarity with AI
                  </h1>
                  <h2 className="max-w-2xl text-base font-normal leading-normal text-mk-text sm:text-lg">
                      Experience the future of personal finance with our AI-powered app. Effortlessly manage your money, gain insights, and achieve your financial goals.
                  </h2>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                  <Button asChild className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 bg-mk-accent text-mk-bg-1 text-base font-bold leading-normal tracking-[0.015em] transition-colors hover:bg-mk-accent/90">
                    <Link href="/entry">Get Started Free</Link>
                  </Button>
                  <a href="#demo" className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 bg-mk-secondary text-white text-base font-bold leading-normal tracking-[0.015em] transition-colors hover:bg-mk-secondary/80">
                      <span className="truncate">Watch Demo</span>
                  </a>
              </div>
          </div>
      </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="flex flex-1 flex-col gap-3 rounded-xl border border-mk-secondary bg-mk-bg-2 p-4">
    <div className="text-mk-accent">{icon}</div>
    <div className="flex flex-col gap-1">
      <h2 className="text-base font-bold leading-tight text-white">{title}</h2>
      <p className="text-sm font-normal leading-normal text-mk-text">{description}</p>
    </div>
  </div>
);

// Features Section Component
const FeaturesSection = () => {
    const features = [
        { icon: <Mic size={24} />, title: 'Voice-Activated Transactions', description: 'Record transactions with simple voice commands, making expense tracking effortless.' },
        { icon: <Receipt size={24} />, title: 'Receipt Scanning & Auto-Fill', description: 'Snap photos of receipts to automatically extract and categorize transaction details.' },
        { icon: <Landmark size={24} />, title: 'Seamless Bank Integration', description: 'Connect your bank accounts for real-time balance updates and transaction history.' },
        { icon: <ChartLine size={24} />, title: 'AI-Powered Budgeting', description: 'Let AI create and optimize your budget based on your spending patterns and goals.' },
        { icon: <Lightbulb size={24} />, title: 'Daily Financial Insights', description: 'Receive daily personalized tips and insights to improve your financial well-being.' },
        { icon: <PiggyBank size={24} />, title: 'Automated Goal Saving', description: 'Set financial goals and let our AI help you save towards them automatically.' },
    ];
    return (
        <section id="features" className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
            <div className="flex flex-col gap-4">
                <h1 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                    Smart Features for Smarter Finances
                </h1>
                <p className="max-w-2xl text-base font-normal leading-normal text-mk-text">
                    Our AI-driven tools simplify money management, providing personalized insights and control over your financial life.
                </p>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {features.map((feature, i) => <FeatureCard key={i} {...feature} />)}
            </div>
        </section>
    );
}

// Demo Section Component
const DemoSection = () => (
    <section id="demo" className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
      <h2 className="text-2xl font-bold leading-tight tracking-tight text-white px-4 pb-3 pt-5 text-center">
        See Finwise AI in Action
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4">
        <div data-ai-hint="dashboard analytics" className="relative w-full aspect-video rounded-xl overflow-hidden">
          <Image
            src="/hero/analytics.jpg"
            alt="Dashboard analytics"
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover"
          />
        </div>
        <div data-ai-hint="budgeting app" className="relative w-full aspect-video rounded-xl overflow-hidden">
          <Image
            src="/hero/budget.jpg"
            alt="Budgeting app interface"
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover"
          />
        </div>
        <div data-ai-hint="mobile finance" className="relative w-full aspect-video rounded-xl overflow-hidden">
          <Image
            src="/hero/mobile.jpg"
            alt="Mobile finance app"
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );


// Pricing Card Component
const PricingCard = ({ plan, price, popular, features }: { plan:string, price:string, popular:boolean, features:string[]}) => (
    <div className="flex flex-1 flex-col gap-4 rounded-xl border border-solid border-mk-secondary bg-mk-bg-2 p-6">
        <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
                <h1 className="text-base font-bold leading-tight text-white">{plan}</h1>
                {popular && <p className="text-mk-bg-1 text-xs font-medium leading-normal tracking-[0.015em] rounded-full bg-mk-accent px-3 py-1 text-center">Most Popular</p>}
            </div>
            <p className="flex items-baseline gap-1 text-white">
                <span className="text-4xl font-black leading-tight tracking-[-0.033em]">${price}</span>
                <span className="text-base font-bold leading-tight">/month</span>
            </p>
        </div>
        <Button asChild className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-mk-secondary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-mk-secondary/80 transition-colors">
          <Link href="/entry">Get Started</Link>
        </Button>
        <div className="flex flex-col gap-2">
            {features.map((feature, i) => (
                <div key={i} className="flex gap-3 text-sm font-normal leading-normal text-white">
                    <Check size={20} className="text-mk-accent shrink-0" />
                    <span>{feature}</span>
                </div>
            ))}
        </div>
    </div>
);

// Pricing Section Component
const PricingSection = () => {
    const plans = [
        { plan: 'Free', price: '0', popular: false, features: ['Basic budgeting', 'Manual transaction entry', 'Limited insights'] },
        { plan: 'Premium', price: '9.99', popular: true, features: ['AI-powered budgeting', 'Automatic transaction import', 'Personalized insights', 'Priority support'] },
        { plan: 'Family', price: '14.99', popular: false, features: ['All Premium features', 'Up to 5 family members', 'Shared budgeting'] },
    ];
    return (
        <section id="pricing" className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
            <h2 className="text-2xl font-bold leading-tight tracking-tight text-white px-4 pb-3 pt-5 text-center">
                Choose the Perfect Plan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                {plans.map((p, i) => <PricingCard key={i} {...p} />)}
            </div>
        </section>
    );
};


// Trust Section Component
const TrustSection = () => {
    const trustItems = [
        { icon: <ShieldCheck size={24}/>, text: 'Banking-Level Encryption'},
        { icon: <Lock size={24}/>, text: 'GDPR Compliant'},
        { icon: <FileText size={24}/>, text: 'Powered by Gemini AI'},
    ];
    return (
        <section id="trust" className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
            <h2 className="text-2xl font-bold leading-tight tracking-tight text-white px-4 pb-3 pt-5 text-center">
                Security & Trust
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                {trustItems.map((item, i) => (
                    <div key={i} className="flex flex-1 items-center gap-3 rounded-lg border border-mk-secondary bg-mk-bg-2 p-4">
                        <div className="text-mk-accent">{item.icon}</div>
                        <h2 className="text-base font-bold leading-tight text-white">{item.text}</h2>
                    </div>
                ))}
            </div>
        </section>
    )
};


// Footer Component
const MarketingFooter = () => (
  <footer className="w-full bg-mk-bg-2">
    <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-5 py-10 text-center">
      <div className="flex flex-wrap items-center justify-center gap-6 sm:justify-around w-full">
        <a className="text-base font-normal leading-normal text-mk-text min-w-40 hover:text-white" href="#">Privacy Policy</a>
        <a className="text-base font-normal leading-normal text-mk-text min-w-40 hover:text-white" href="#">Terms of Service</a>
        <a className="text-base font-normal leading-normal text-mk-text min-w-40 hover:text-white" href="#">Contact Us</a>
      </div>
      <div className="flex justify-center gap-4">
          <a href="#" aria-label="Twitter"><Twitter className="text-mk-text hover:text-white" /></a>
          <a href="#" aria-label="Instagram"><Instagram className="text-mk-text hover:text-white" /></a>
          <a href="#" aria-label="Facebook"><Facebook className="text-mk-text hover:text-white" /></a>
      </div>
      <p className="text-base font-normal leading-normal text-mk-text">© 2024 Finwise AI. All rights reserved.</p>
    </div>
  </footer>
);


export default function MarketingPage() {
    return (
        <div className="marketing-body font-headline flex flex-col">
            <MarketingHeader />
            <main className="flex-grow">
                <HeroSection />
                <FeaturesSection />
                <DemoSection />
                <PricingSection />
                <TrustSection />
            </main>
            <MarketingFooter />
        </div>
    );
}
