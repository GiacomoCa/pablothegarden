'use client';

import { usePathname } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';

export interface NavItem {
  href: string;
  label: string;
}

interface NavigationProps {
  items: NavItem[];
  className?: string;
  linkClassName?: string;
  activeLinkClassName?: string;
  onClick?: () => void;
  direction?: 'horizontal' | 'vertical';
}

export default function Navigation({
  items,
  className = '',
  linkClassName = '',
  activeLinkClassName = '',
  onClick,
  direction = 'horizontal',
}: NavigationProps) {
  const pathname = usePathname();

  const isActive = (href: string): boolean => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav
      className={`${
        direction === 'horizontal' ? 'flex items-center gap-1' : 'flex flex-col gap-1'
      } ${className}`}
    >
      {items.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            className={`${linkClassName} ${active ? activeLinkClassName : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
