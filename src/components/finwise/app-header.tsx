'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, PiggyBank, Settings, Camera } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getFunctions, httpsCallable } from 'firebase/functions';
import type { User } from 'firebase/auth';
import type { Notification } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

const functions = getFunctions();
const markNotificationsAsReadFn = httpsCallable(functions, 'markNotificationsAsRead');

interface AppHeaderProps {
  user: User | null;
  onOcr: () => void;
  notifications?: Notification[];
}

export function AppHeader({ user, onOcr, notifications = [] }: AppHeaderProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleOpenChange = (open: boolean) => {
    setPopoverOpen(open);
    if (open && unreadCount > 0) {
      const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
      try {
        markNotificationsAsReadFn({ notificationIds: unreadIds });
        // Note: The UI will update automatically due to the real-time listener in useNotifications.
      } catch (e) {
        console.error("Failed to mark notifications as read", e);
      }
    }
  };

  return (
    <header className="fixed top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <PiggyBank className="h-6 w-6 text-primary" />
          <h1 className="font-headline text-xl font-bold">Finwise AI</h1>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onOcr} aria-label="Scan receipt">
            <Camera className="h-5 w-5" />
          </Button>

          <Popover open={popoverOpen} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open notifications" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">通知</h4>
                        <p className="text-sm text-muted-foreground">
                            最近のお知らせ
                        </p>
                    </div>
                    <div className="grid gap-2">
                        {notifications.length > 0 ? notifications.slice(0, 5).map(n => (
                            <div key={n.id} className="grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                                <span className={`flex h-2 w-2 translate-y-1 rounded-full ${!n.isRead ? 'bg-sky-500' : ''}`} />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">{n.message}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatDistanceToNow(n.createdAt.toDate(), { addSuffix: true, locale: ja })}
                                    </p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-sm text-muted-foreground text-center py-4">通知はありません。</p>
                        )}
                    </div>
                </div>
            </PopoverContent>
          </Popover>

          {/* This should probably be a dropdown menu on a user avatar */}
          <Button variant="ghost" size="icon" onClick={() => {}} aria-label="Open settings">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
