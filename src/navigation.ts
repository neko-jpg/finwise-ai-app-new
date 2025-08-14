import {
  createLocalizedPathnamesNavigation,
  Pathnames
} from 'next-intl/navigation';
 
export const locales = ['en', 'ja'] as const;
export const localePrefix = 'always'; // Default
 
// The `pathnames` object holds pairs of internal
// and external paths, separated by locale.
export const pathnames = {
  // If all locales use the same path, use the
  // default:
  '/': '/',
  '/blog': '/blog',
 
  // If locales use different paths, specify them
  // individually:
  '/about': {
    en: '/about',
    ja: '/about'
  },
 
  // Dynamic params are supported via square brackets
  '/news/[articleSlug]-[articleId]': {
    en: '/news/[articleSlug]-[articleId]',
    ja: '/news/[articleSlug]-[articleId]'
  },
 
  // Also (optional) catch-all segments are supported
  '/categories/[...slug]': {
    en: '/categories/[...slug]',
    ja: '/categories/[...slug]'
  }
} satisfies Pathnames<typeof locales>;
 
export const {Link, redirect, usePathname, useRouter, getPathname} =
  createLocalizedPathnamesNavigation({locales, localePrefix, pathnames});