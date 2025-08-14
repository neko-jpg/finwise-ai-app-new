
'use client';
import { m } from 'framer-motion';
import { Mic, Receipt, Banknote, BrainCircuit, Lightbulb, type LucideIcon } from 'lucide-react';
import React from 'react';

const cardVariants = {
  offscreen: {
    y: 50,
    opacity: 0,
  },
  onscreen: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      bounce: 0.4,
      duration: 0.8,
      delay: i * 0.1,
    }
  })
};

const FEATURES: {icon: LucideIcon; title: string; description: string}[] = [
    {
        icon: Mic,
        title: "Voice-Activated Transactions",
        description: "Record transactions with simple voice commands, making expense tracking effortless."
    },
    {
        icon: Receipt,
        title: "Receipt Scanning & Auto-Fill",
        description: "Snap photos of receipts to automatically extract and categorize transaction details."
    },
    {
        icon: Banknote,
        title: "Seamless Bank Integration",
        description: "Connect your bank accounts for real-time balance updates and transaction history."
    },
    {
        icon: BrainCircuit,
        title: "AI-Powered Budgeting",
        description: "Let AI create and optimize your budget based on your spending patterns and goals."
    },
    {
        icon: Lightbulb,
        title: "Daily Financial Insights",
        description: "Receive daily personalized tips and insights to improve your financial well-being."
    }
]

export function ValueCards() {
  return (
    <section id="features" className="py-24 sm:py-32 scroll-mt-20 bg-mk-bg-1">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <m.div
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true, amount: 0.5 }}
                 transition={{ duration: 0.6 }}
                 className="mx-auto max-w-3xl text-center"
            >
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    Smart Features for Smarter Finances
                </h2>
                <p className="mt-6 text-lg leading-8 text-mk-text">
                   Our AI-driven tools simplify money management, providing personalized insights and control over your financial life.
                </p>
            </m.div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                <m.div 
                    initial="offscreen"
                    whileInView="onscreen"
                    viewport={{ once: true, amount: 0.2 }}
                    className="grid grid-cols-1 gap-4 lg:grid-cols-3"
                >
                    {FEATURES.map((feature, i) => (
                        <m.div 
                            key={feature.title} 
                            variants={cardVariants} 
                            custom={i} 
                            className="flex flex-col rounded-xl bg-mk-bg-2 p-6 border border-mk-secondary transition-all duration-300 hover:border-mk-accent/80 hover:-translate-y-1 hover:shadow-2xl hover:shadow-mk-accent/10"
                        >
                           <div className="text-mk-accent bg-mk-secondary p-3 rounded-lg self-start">
                                <feature.icon className="h-6 w-6" />
                           </div>
                           <h3 className="mt-4 text-lg font-bold leading-7 text-white">{feature.title}</h3>
                           <p className="mt-1 flex-auto text-base leading-7 text-mk-text">{feature.description}</p>
                        </m.div>
                    ))}
                </m.div>
            </div>
        </div>
    </section>
  );
}
