
'use client';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sparkles } from 'lucide-react';

function roundTo(n:number, step=100){ return Math.round(n/step)*step; }
function clamp(n:number,min:number,max:number){ return Math.max(min, Math.min(max, n)); }

export function BudgetInput({
  label, value: initialValue, used=0, threshold=20000, onChange, onAiSuggest
}:{ label:string; value:number; used?:number; threshold?:number; onChange:(v:number)=>void; onAiSuggest?:()=>void }){
  const [value, setValue] = useState(initialValue);
  const mode = value > threshold ? 'direct' : 'slider';
  const pct = Math.min(100, Math.round((used / Math.max(1, value)) * 100));
  
  // Sync with external changes
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const commit = (v:number) => {
      const n = clamp(roundTo(v, 100), 0, 1_000_000);
      setValue(n);
      onChange(n); 
  };

  return (
    <div className="rounded-2xl border bg-card text-card-foreground p-4 flex flex-col justify-between">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="font-medium">{label}</div>
           {onAiSuggest && <Button variant="ghost" size="sm" onClick={onAiSuggest} className="gap-1 text-primary hover:text-primary"><Sparkles className="h-4 w-4" />提案</Button>}
        </div>
        <div className="text-sm text-muted-foreground mb-1">使用：¥{used.toLocaleString()} / 予算：¥{value.toLocaleString()}</div>
        <Progress value={pct} />
        <div className="text-xs text-muted-foreground mt-1">{pct}% 使用済み</div>
      </div>

      <div className="mt-4">
        {mode === 'slider' ? (
          <div className="space-y-3">
            <Slider value={[value]} max={threshold} step={500} onValueChange={(v)=>setValue(v[0])} onValueCommit={(v)=>commit(v[0])} />
            <div className="grid grid-cols-3 gap-2">
              <Button size="sm" variant="secondary" onClick={()=>commit(value-500)}>-500</Button>
              <Button size="sm" variant="secondary" onClick={()=>commit(value+500)}>+500</Button>
              <Button size="sm" variant="outline" onClick={()=>commit(value+5000)}>+5k</Button>
              <Button size="sm" variant="outline" onClick={()=>commit(threshold)}>上限へ</Button>
              <Button size="sm" variant="ghost" onClick={()=>commit(threshold+1000)}>直接入力</Button>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-2">
            <Input 
                type="number"
                inputMode="numeric" 
                pattern="[0-9]*" 
                defaultValue={value} 
                onBlur={(e)=>commit(Number(e.target.value.replace(/[^0-9]/g,'')))}
                className="text-lg font-bold"
            />
            <Button variant="secondary" onClick={()=>commit(threshold)}>スライダーへ</Button>
          </div>
        )}
      </div>
    </div>
  );
}
