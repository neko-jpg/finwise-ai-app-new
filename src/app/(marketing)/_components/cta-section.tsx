
'use client';
import { m } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Check } from 'lucide-react';

const faqs = [
    {
        q: 'Is Finwise AI secure?',
        a: 'Yes, we use bank-level encryption and follow industry best practices to ensure your data is always safe and private. We never sell your data.',
    },
    {
        q: 'Can I cancel my subscription anytime?',
        a: 'Absolutely. You can cancel your Premium or Family plan at any time, no questions asked. You will retain access until the end of your billing period.',
    },
    {
        q: 'What if I need help?',
        a: 'We offer comprehensive support to all our users. Premium and Family plan members enjoy priority support for faster response times.',
    },
];

export function CtaSection() {
  return (
    <section className="py-24 sm:py-32 bg-mk-bg-1" id="pricing">
        <m.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-7xl px-6"
        >
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    Ready to Unlock Financial Clarity?
                </h2>
                <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-mk-text">
                    Choose the plan that’s right for you and start your journey towards smarter money management today.
                </p>
            </div>
            
            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
                <PricingCard 
                    plan="Free" 
                    price="$0" 
                    description="For individuals starting out" 
                    features={['Basic budgeting', 'Manual transaction entry', 'Limited insights']}
                    cta="Get Started"
                    planKey="free"
                />
                <PricingCard 
                    plan="Premium" 
                    price="$9.99" 
                    description="For proactive individuals" 
                    features={['AI-powered budgeting', 'Automatic transaction import', 'Personalized insights', 'Priority support']}
                    cta="Upgrade to Premium"
                    isPopular
                    planKey="premium"
                />
                <PricingCard 
                    plan="Family" 
                    price="$14.99" 
                    description="For families to collaborate" 
                    features={['All Premium features', 'Up to 5 family members', 'Shared budgeting & goals']}
                    cta="Choose Family"
                    planKey="family"
                />
            </div>

            <div className="mt-24 max-w-3xl mx-auto">
                <h3 className="text-2xl font-bold text-center text-white">Frequently Asked Questions</h3>
                 <Accordion type="single" collapsible className="w-full mt-8">
                    {faqs.map((faq, i) => (
                        <AccordionItem key={i} value={`item-${i}`} className="border-mk-secondary">
                            <AccordionTrigger className="text-white text-lg hover:no-underline hover:text-mk-accent">{faq.q}</AccordionTrigger>
                            <AccordionContent className="text-base text-mk-text">
                               {faq.a}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>

      </m.div>
    </section>
  );
}

function PricingCard({ plan, price, description, features, cta, isPopular = false, planKey }: {
    plan: string;
    price: string;
    description: string;
    features: string[];
    cta: string;
    isPopular?: boolean;
    planKey: string;
}) {
    return (
        <div className={`relative flex flex-col gap-6 rounded-xl border p-6 transition-all duration-300 ${isPopular ? 'border-mk-accent' : 'border-mk-secondary' } bg-mk-bg-2 hover:border-mk-accent hover:-translate-y-2`}>
            {isPopular && <p className="absolute -top-3 right-6 text-mk-bg-1 text-xs font-semibold leading-normal tracking-wide rounded-full bg-mk-accent px-3 py-1 text-center">Most Popular</p>}
            <div className="flex flex-col gap-1">
                <h3 className="text-white text-xl font-bold leading-tight">{plan}</h3>
                <p className="flex items-baseline gap-1 text-white">
                    <span className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">{price}</span>
                    <span className="text-white/80 text-base font-bold leading-tight">/month</span>
                  </p>
            </div>
             <Button asChild size="lg" className={`w-full font-bold ${isPopular ? 'bg-mk-accent text-mk-bg-1 hover:bg-mk-accent/90' : 'bg-mk-secondary hover:bg-mk-accent/20'}`}>
                <Link href={`/entry?plan=${planKey}`}>{cta}</Link>
             </Button>
            <div className="flex flex-col gap-3 pt-3 border-t border-mk-secondary">
                {features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-white/90 text-sm">
                        <Check className="h-4 w-4 text-mk-accent" />
                        {feature}
                    </div>
                ))}
            </div>
        </div>
    )
}
