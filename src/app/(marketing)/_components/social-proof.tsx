
'use client';

import { m } from 'framer-motion';
import { Star } from 'lucide-react';
import Image from 'next/image';

const testimonials = [
  {
    body: 'Voice-activated transaction entry is a game-changer. I finally stuck to a budget!',
    author: {
      name: 'Yuna Sato',
      handle: 'Designer in Tokyo',
      imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop',
      hint: 'woman portrait',
    },
  },
  {
    body: 'The AI saving tips are surprisingly accurate. They helped me identify and cut unnecessary costs.',
    author: {
      name: 'Kenta Tanaka',
      handle: 'Engineer, 20s',
      imageUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=400&auto=format&fit=crop',
      hint: 'man portrait',
    },
  },
   {
    body: 'Just taking a picture of a receipt is revolutionary. No more tedious manual entry!',
    author: {
      name: 'Misaki Suzuki',
      handle: 'Homemaker, 30s',
      imageUrl: 'https://images.unsplash.com/photo-1544717297-fa95b9ee9643?q=80&w=400&auto=format&fit=crop',
      hint: 'woman professional',
    },
  },
]

export function SocialProof() {
  return (
    <section className="relative isolate overflow-hidden bg-mk-bg-2 px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-2xl lg:max-w-5xl">
        <m.div 
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             viewport={{ once: true, amount: 0.5 }}
             className="mx-auto text-center"
        >
            <div className="flex items-center justify-center gap-1 text-yellow-400 mb-2">
                {[...Array(5)].map((_,i) => <Star key={i} className="h-5 w-5 fill-current" />)}
            </div>
            <p className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Trusted by Users Like You
            </p>
        </m.div>
        <div className="mx-auto mt-16 flow-root">
          <div className="-m-2 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {testimonials.map((testimonial, i) => (
            <m.figure 
                key={testimonial.author.name} 
                initial={{opacity: 0, y: 30}}
                whileInView={{opacity: 1, y: 0}}
                viewport={{ once: true, amount: 0.5 }}
                transition={{delay: i * 0.1, duration: 0.5}}
                className="rounded-2xl bg-mk-bg-1 p-6 shadow-lg ring-1 ring-white/10"
            >
              <blockquote className="text-white/90">
                <p>{`“${testimonial.body}”`}</p>
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-x-4">
                <Image className="h-12 w-12 rounded-full object-cover" src={testimonial.author.imageUrl} alt="" width={48} height={48} data-ai-hint={testimonial.author.hint} />
                <div>
                  <div className="font-semibold text-white">{testimonial.author.name}</div>
                  <div className="text-mk-text">{testimonial.author.handle}</div>
                </div>
              </figcaption>
            </m.figure>
          ))}
          </div>
        </div>
      </div>
    </section>
  )
}
