
'use client';
import { m } from 'framer-motion';
import Image from 'next/image';

const demos = [
    {
        imgSrc: 'https://images.unsplash.com/photo-1628191137358-76837a7a5a87?q=80&w=2874&auto=format&fit=crop',
        hint: 'dashboard ui'
    },
    {
        imgSrc: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=2874&auto=format&fit=crop',
        hint: 'mobile ui'
    },
    {
        imgSrc: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?q=80&w=2940&auto=format&fit=crop',
        hint: 'analytics chart'
    }
]

export function ScrollDemo() {
  return (
    <section id="demo" className="py-24 sm:py-32 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <m.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6 }}
                className="text-center"
            >
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">See FinAI in Action</h2>
                <p className="mt-6 text-lg leading-8 text-white/70">
                    Discover how our intuitive interface makes financial management a breeze.
                </p>
            </m.div>

            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
                {demos.map((demo, i) => (
                     <m.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.5, delay: i * 0.15 }}
                     >
                        <div className="w-full aspect-video rounded-xl overflow-hidden shadow-2xl shadow-mk-bg-2/50 border border-mk-secondary/20 hover:scale-105 transition-transform duration-300">
                           <Image 
                                src={demo.imgSrc} 
                                alt={`FinAI Demo Screenshot ${i+1}`} 
                                width={800} 
                                height={450} 
                                className="w-full h-full object-cover"
                                data-ai-hint={demo.hint}
                            />
                        </div>
                    </m.div>
                ))}
            </div>
        </div>
    </section>
  );
}
