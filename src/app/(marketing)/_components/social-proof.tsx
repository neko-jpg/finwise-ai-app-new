
'use client';

import { m } from 'framer-motion';
import { Star } from 'lucide-react';
import Image from 'next/image';

const testimonials = [
  {
    body: '音声でサッと登録できるのが本当に楽。今まで家計簿が続かなかった自分が嘘みたいです。',
    author: {
      name: '佐藤 優奈',
      handle: '都内在住・デザイナー',
      imageUrl: 'https://placehold.co/100x100.png',
      hint: 'woman portrait',
    },
  },
  {
    body: 'AIが提案してくれる節約のヒントが的確で、毎月固定費を見直すきっかけになりました。',
    author: {
      name: '田中 健太',
      handle: '20代・エンジニア',
      imageUrl: 'https://placehold.co/100x100.png',
      hint: 'man portrait',
    },
  },
   {
    body: 'レシートを撮るだけでいいなんて革命的。買い物の後の面倒な入力から解放されました。',
    author: {
      name: '鈴木 美咲',
      handle: '30代・主婦',
      imageUrl: 'https://placehold.co/100x100.png',
      hint: 'woman professional',
    },
  },
]

export function SocialProof() {
  return (
    <section className="relative isolate overflow-hidden px-6 py-24 sm:py-32 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-white/5" />
      <div className="mx-auto max-w-2xl lg:max-w-4xl">
        <m.div 
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             viewport={{ once: true, amount: 0.5 }}
             className="mx-auto text-center"
        >
            <div className="flex items-center justify-center gap-1 text-yellow-400 mb-2">
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
            </div>
            <p className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                多くのユーザーに支持されています
            </p>
        </m.div>
        <m.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ staggerChildren: 0.2 }}
            className="mx-auto mt-16 grid max-w-2xl grid-cols-1 grid-rows-1 gap-8 text-sm leading-6 text-white/80 sm:grid-cols-2 xl:mx-0 xl:max-w-none xl:grid-flow-col xl:grid-cols-3"
        >
          {testimonials.map((testimonial, i) => (
            <m.figure 
                key={testimonial.author.name} 
                initial={{opacity: 0, y: 30}}
                whileInView={{opacity: 1, y: 0}}
                viewport={{ once: true, amount: 0.5 }}
                transition={{delay: i * 0.1}}
                className="rounded-2xl bg-white/5 p-6 shadow-lg ring-1 ring-white/10"
            >
              <blockquote className="text-white">
                <p>{`“${testimonial.body}”`}</p>
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-x-4">
                <Image className="h-10 w-10 rounded-full bg-gray-50" src={testimonial.author.imageUrl} alt="" width={40} height={40} data-ai-hint={testimonial.author.hint} />
                <div>
                  <div className="font-semibold text-white">{testimonial.author.name}</div>
                  <div className="text-white/70">{testimonial.author.handle}</div>
                </div>
              </figcaption>
            </m.figure>
          ))}
        </m.div>
      </div>
    </section>
  )
}
