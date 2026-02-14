import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

// Since we have a `[locale]` dynamic segment, this root layout
// just passes children through. The actual HTML structure is in
// `[locale]/layout.tsx`.
export default function RootLayout({ children }: Props) {
  return children;
}
