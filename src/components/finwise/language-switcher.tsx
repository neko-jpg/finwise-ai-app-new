
'use client';

import { Globe } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {useLocale, useTranslations} from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useTransition } from "react";


export function LanguageSwitcher() {
  const t = useTranslations('LanguageSwitcher');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = (lang: 'ja' | 'en') => {
    startTransition(() => {
      router.replace(`/${lang}${pathname}`);
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={isPending}>
          <Globe className="h-5 w-5"/>
          <span className="sr-only">Change Language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleLanguageChange('ja')} disabled={locale === 'ja'}>
          {t('locale', {locale: 'ja'})}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLanguageChange('en')} disabled={locale === 'en'}>
          {t('locale', {locale: 'en'})}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
