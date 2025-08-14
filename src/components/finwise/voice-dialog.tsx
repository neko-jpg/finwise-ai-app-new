import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Mic, Search } from "lucide-react";

interface VoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VoiceDialog({ open, onOpenChange }: VoiceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center gap-2"><Mic/>音声アシスタント</DialogTitle>
          <DialogDescription>例：「今日の支出は？」「食費の予算残額は？」</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 rounded-lg border p-2">
          <Input placeholder="聞きたいことを話すか入力..." className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0" />
          <Button size="icon"><Search className="h-4 w-4" /></Button>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
            <Button variant="outline" size="sm" className="text-xs h-auto py-1.5">今日の支出は？</Button>
            <Button variant="outline" size="sm" className="text-xs h-auto py-1.5">食費の残額</Button>
            <Button variant="outline" size="sm" className="text-xs h-auto py-1.5">今週の無駄遣い</Button>
            <Button variant="outline" size="sm" className="text-xs h-auto py-1.5">台湾旅行の進捗</Button>
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          ※ Web Speech API 連携をここに実装（開始/停止・結果テキスト化・エラー処理）
        </div>
      </DialogContent>
    </Dialog>
  );
}
