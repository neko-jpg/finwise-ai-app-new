'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from 'firebase/auth';
import { Combobox } from '@/components/ui/combobox'; // Assuming a combobox component exists

const functions = getFunctions();
const getCoinListFn = httpsCallable(functions, 'getCoinList');

interface CryptoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User;
  familyId?: string;
}

interface Coin {
  id: string;
  symbol: string;
  name: string;
}

export function CryptoForm({ open, onOpenChange, user, familyId }: CryptoFormProps) {
  const { toast } = useToast();
  const [coinList, setCoinList] = useState<Coin[]>([]);
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [quantity, setQuantity] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchCoinList = async () => {
      try {
        const result = await getCoinListFn();
        setCoinList(result.data as Coin[]);
      } catch (e) {
        console.error("Failed to fetch coin list", e);
        toast({ title: "コインリストの取得に失敗しました", variant: "destructive" });
      }
    };
    fetchCoinList();
  }, [toast]);

  const handleSubmit = async () => {
    if (!user || !familyId || !selectedCoin || quantity <= 0) {
      toast({ title: "入力内容を確認してください", description: "コインを選択し、数量を正しく入力してください。", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      // Step 1: Create or update the Security document for the coin
      const securityRef = doc(db, 'securities', selectedCoin.id);
      await setDoc(securityRef, {
        id: selectedCoin.id,
        assetType: 'crypto',
        name: selectedCoin.name,
        tickerSymbol: selectedCoin.symbol,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      // Step 2: Create the Holding document
      await addDoc(collection(db, 'holdings'), {
        familyId,
        userId: user.uid,
        securityId: selectedCoin.id,
        quantity,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast({ title: "暗号資産を追加しました" });
      onOpenChange(false);
      // Reset form
      setSelectedCoin(null);
      setQuantity(0);
    } catch (e) {
      console.error("Failed to save crypto holding", e);
      toast({ title: "保存に失敗しました", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const comboboxOptions = coinList.map(coin => ({
    value: coin.id,
    label: `${coin.name} (${coin.symbol.toUpperCase()})`,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>暗号資産を追加</DialogTitle>
          <DialogDescription>
            保有している暗号通貨の銘柄と数量を入力してください。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="coin" className="text-right">銘柄</Label>
            {/* This assumes a combobox component exists at "@/components/ui/combobox" */}
            <Combobox
              options={comboboxOptions}
              value={selectedCoin?.id}
              onChange={(value) => {
                const coin = coinList.find(c => c.id === value);
                setSelectedCoin(coin || null);
              }}
              placeholder="コインを検索..."
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">数量</Label>
            <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(parseFloat(e.target.value))} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? '保存中...' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
