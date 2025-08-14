
'use client';
import { m, useScroll, useTransform } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CATEGORIES } from '@/data/dummy-data';
import { format } from 'date-fns';
import { useState, useEffect, useRef } from 'react';
import Lottie from 'lottie-react';
import voiceAnimation from './lottie/voice-wave.json';

const DemoTransaction = ({ progress, opacity }: { progress: any, opacity: any }) => {
    const category = CATEGORIES.find(c => c.key === 'food');
    return (
        <m.div style={{ opacity }} className="group flex items-center justify-between p-4 bg-white/10 rounded-lg mt-4">
             <div className="flex items-center gap-4">
                <div className="p-2 bg-muted rounded-full">{category?.icon}</div>
                <div>
                    <m.div style={{ opacity: progress > 0.5 ? 1: 0}} className="font-medium">カフェ</m.div>
                    <div className="text-xs text-white/60">{format(new Date(), 'yyyy-MM-dd')}</div>
                </div>
            </div>
             <div className="text-right">
                <m.div style={{ opacity: progress > 0.6 ? 1: 0}} className="font-bold font-mono text-white">
                    -¥580
                </m.div>
                <m.div style={{ opacity: progress > 0.7 ? 1: 0}} className="mt-1 text-xs px-2 py-0.5 rounded-full bg-white/20 text-white">
                    {category?.label}
                </m.div>
            </div>
        </m.div>
    );
};


export function ScrollDemo() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ 
      target: targetRef,
      offset:['start end', 'end start'] 
  });

  const scale = useTransform(scrollYProgress, [0, 0.4, 0.9, 1], [0.9, 1, 1, 0.9]);
  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
  const gauge = useTransform(scrollYProgress, [0.3, 0.9], [35, 68]);
  const textOpacity = useTransform(scrollYProgress, [0.1, 0.2, 0.8, 0.9], [0, 1, 1, 0]);
  
  const [lottieOpacity, setLottieOpacity] = useState(0);
  const [txOpacity, setTxOpacity] = useState(0);

  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
        setLottieOpacity(latest > 0.2 && latest < 0.5 ? 1 : 0);
        setTxOpacity(latest > 0.4 ? 1 : 0);
    });
  }, [scrollYProgress]);

  return (
    <section id="demo" ref={targetRef} className="py-24 sm:py-32 h-[200vh]">
        <div className="sticky top-24">
            <m.div style={{ opacity: textOpacity }} className="mx-auto max-w-2xl lg:text-center px-6 mb-12">
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    体験デモ：スクロールで見るAI家計簿
                </h2>
                <p className="mt-6 text-lg leading-8 text-white/70">
                    スクロールして、Finwise AIがあなたの毎日をどう変えるかご覧ください。
                </p>
            </m.div>
            <m.div style={{ scale, opacity }} className="mx-auto max-w-2xl">
                <Card className="bg-white/5 border-white/10 text-white backdrop-blur-xl p-6 rounded-2xl">
                    <CardContent className="p-0">
                        <div className="flex justify-between items-center text-sm mb-2 text-white/80">
                           <span>音声入力</span>
                           <Lottie animationData={voiceAnimation} style={{width: 80, height: 40, opacity: lottieOpacity, transition: 'opacity 0.3s'}} loop={true} />
                        </div>
                        <div className="relative w-full h-12 rounded-lg bg-black/20 flex items-center px-4">
                           <m.span style={{ opacity: useTransform(scrollYProgress, [0.25, 0.4], [0, 1]) }} className='italic'>「カフェ 580円」</m.span>
                        </div>
                        
                        <DemoTransaction progress={scrollYProgress} opacity={txOpacity} />
                        
                        <div className="mt-8">
                            <div className="text-white/70 text-sm mb-2">今月の予算使用率</div>
                            <div className="w-full bg-white/10 rounded-full h-3">
                                 <m.div style={{ width: gauge.to(v => `${v}%`)}} className="h-3 rounded-full bg-mk-accent" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </m.div>
        </div>
    </section>
  );
}
