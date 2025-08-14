
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
        icon: <Mic className="h-8 w-8 text-mk-accent" />,
        title: "『カフェ 580円』で登録完了",
        description: "音声入力で、いつでもどこでも支出を記録。AIが自動で内容を解釈し、カテゴリ分類まで行います。"
    },
    {
        icon: <ScanLine className="h-8 w-8 text-mk-accent" />,
        title: "レシートを撮るだけ",
        description: "面倒な手入力は不要。レシートを撮影するだけで、店名・金額・日付をAI-OCRが瞬時にデータ化します。"
    },
    {
        icon: <Landmark className="h-8 w-8 text-mk-accent" />,
        title: "口座をつなげて自動で同期",
        description: "複数の銀行口座やクレジットカードを連携。取引履歴を自動で取り込み、お金の流れを一つにまとめます。（近日公開）"
    }
]

export function ValueCards() {
  return (
    <section id="features" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
                <p className="text-base font-semibold leading-7 text-mk-accent">AIで家計をもっとスマートに</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    あなたの専属ファイナンシャル・アシスタント
                </h2>
                <p className="mt-6 text-lg leading-8 text-white/70">
                    Finwise AIは、最新のAI技術であなたの家計管理を次のレベルへ。面倒な作業はAIに任せて、あなたは「お金とどう向き合うか」に集中できます。
                </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                <m.div 
                    initial="offscreen"
                    whileInView="onscreen"
                    viewport={{ once: true, amount: 0.3 }}
                    className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-3"
                >
                    {FEATURES.map((feature, i) => (
                        <m.div key={feature.title} variants={cardVariants} custom={i} className="flex flex-col items-start p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg hover:-translate-y-2 transition-transform duration-300">
                           <div className="bg-mk-accent/10 p-3 rounded-lg mb-4">
                                {feature.icon}
                           </div>
                           <h3 className="text-lg font-semibold leading-7 text-white">{feature.title}</h3>
                           <p className="mt-2 flex-auto text-base leading-7 text-white/70">{feature.description}</p>
                        </m.div>
                    ))}
                </m.div>
            </div>
        </div>
    </section>
  );
}
