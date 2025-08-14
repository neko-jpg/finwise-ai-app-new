
'use client';
import { m } from 'framer-motion';
import { Mic, ScanLine, Landmark } from 'lucide-react';
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

const FEATURES = [
    {
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M128,176a48.05,48.05,0,0,0,48-48V64a48,48,0,0,0-96,0v64A48.05,48.05,0,0,0,128,176ZM96,64a32,32,0,0,1,64,0v64a32,32,0,0,1-64,0Zm40,143.6V232a8,8,0,0,1-16,0V207.6A80.11,80.11,0,0,1,48,128a8,8,0,0,1,16,0,64,64,0,0,0,128,0,8,8,0,0,1,16,0A80.11,80.11,0,0,1,136,207.6Z"></path></svg>,
        title: "Voice-Activated Transactions",
        description: "Record transactions with simple voice commands, making expense tracking effortless."
    },
    {
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M72,104a8,8,0,0,1,8-8h96a8,8,0,0,1,0,16H80A8,8,0,0,1,72,104Zm8,40h96a8,8,0,0,0,0-16H80a8,8,0,0,0,0,16ZM232,56V208a8,8,0,0,1-11.58,7.15L192,200.94l-28.42,14.21a8,8,0,0,1-7.16,0L128,200.94,99.58,215.15a8,8,0,0,1-7.16,0L64,200.94,35.58,215.15A8,8,0,0,1,24,208V56A16,16,0,0,1,40,40H216A16,16,0,0,1,232,56Zm-16,0H40V195.06l20.42-10.22a8,8,0,0,1,7.16,0L96,199.06l28.42-14.22a8,8,0,0,1,7.16,0L160,199.06l28.42-14.22a8,8,0,0,1,7.16,0L216,195.06Z"></path></svg>,
        title: "Receipt Scanning & Auto-Fill",
        description: "Snap photos of receipts to automatically extract and categorize transaction details."
    },
    {
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M24,104H48v64H32a8,8,0,0,0,0,16H224a8,8,0,0,0,0-16H208V104h24a8,8,0,0,0,4.19-14.81l-104-64a8,8,0,0,0-8.38,0l-104,64A8,8,0,0,0,24,104Zm40,0H96v64H64Zm80,0v64H112V104Zm48,64H160V104h32ZM128,41.39,203.74,88H52.26ZM248,208a8,8,0,0,1-8,8H16a8,8,0,0,1,0-16H240A8,8,0,0,1,248,208Z"></path></svg>,
        title: "Seamless Bank Integration",
        description: "Connect your bank accounts for real-time balance updates and transaction history."
    }
]

export function ValueCards() {
  return (
    <section id="features" className="py-24 sm:py-32 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <m.div
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true, amount: 0.5 }}
                 transition={{ duration: 0.6 }}
                 className="mx-auto max-w-3xl lg:text-center"
            >
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    Smart Features for Smarter Finances
                </h2>
                <p className="mt-6 text-lg leading-8 text-white/70">
                   Our AI-driven tools simplify money management, providing personalized insights and control over your financial life.
                </p>
            </m.div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                <m.div 
                    initial="offscreen"
                    whileInView="onscreen"
                    viewport={{ once: true, amount: 0.2 }}
                    className="grid grid-cols-1 gap-8 lg:grid-cols-3"
                >
                    {FEATURES.map((feature, i) => (
                        <m.div key={feature.title} variants={cardVariants} custom={i} className="flex flex-col rounded-xl bg-mk-bg-2 p-6 border border-mk-secondary/50 transition-all duration-300 hover:border-mk-accent/80 hover:-translate-y-2 hover:shadow-2xl hover:shadow-mk-accent/10">
                           <div className="text-mk-accent">
                                {feature.icon}
                           </div>
                           <h3 className="mt-4 text-lg font-bold leading-7 text-white">{feature.title}</h3>
                           <p className="mt-2 flex-auto text-base leading-7 text-white/70">{feature.description}</p>
                        </m.div>
                    ))}
                </m.div>
            </div>
        </div>
    </section>
  );
}
