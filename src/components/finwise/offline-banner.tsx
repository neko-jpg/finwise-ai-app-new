import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  return (
    <div className="sticky top-[61px] z-30 bg-amber-100 text-amber-900 border-b border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-900">
        <div className="mx-auto max-w-5xl px-4 py-2 flex items-center gap-2 text-sm font-medium">
            <WifiOff className="h-4 w-4" />
            <span>オフラインモードです。キャッシュされたデータを表示しています。</span>
        </div>
    </div>
  );
}
