// This file is no longer used for the main layout.
// The main layout is now in src/app/[locale]/layout.tsx.
// This file can be deleted, but we'll keep it for now to avoid breaking anything.
// It will just render its children.

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
