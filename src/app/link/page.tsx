

'use client';

import { AppContainer } from '@/components/finwise/app-container';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, ShieldCheck } from "lucide-react";

const dummyProviders = [
    { name: "デモ銀行", logo: "🏦" },
    { name: "サンプルカード", logo: "💳" },
    { name: "デモ証券", logo: "📈" },
];

export function LinkScreen() {
    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center">
                <h2 className="text-2xl font-bold font-headline flex items-center justify-center gap-2"><Wallet />銀行・カード連携</h2>
                <p className="text-muted-foreground">複数の金融機関を連携し、取引を自動で取り込みます。</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>連携する金融機関を選択</CardTitle>
                    <CardDescription>一覧から連携したい銀行やカード会社を選んでください。</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {dummyProviders.map((p, i) => (
                        <Button key={i} variant="outline" size="lg" className="w-full justify-start gap-4 text-base h-14">
                            <span className="text-2xl">{p.logo}</span>
                            <span>{p.name}</span>
                        </Button>
                    ))}
                </CardContent>
            </Card>
            
            <div className="text-center text-xs text-muted-foreground flex items-center justify-center gap-2 p-4 border rounded-lg">
                <ShieldCheck className="h-4 w-4" />
                <span>データは安全に暗号化され、読み取り専用で取得されます。</span>
            </div>
        </div>
    );
}


export default function LinkPage() {
    return (
        <AppContainer>
            <LinkScreen />
        </AppContainer>
    );
}
