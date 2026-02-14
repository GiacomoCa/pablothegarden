'use client';

import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

interface ContactItem {
  label: string;
  value: string;
  href: string;
  icon: ReactNode;
  external?: boolean;
}

export default function DirectContact() {
  const t = useTranslations('contact');

  const contacts: ContactItem[] = [
    {
      label: t('direct_email'),
      value: 'info@pablothegarden.com',
      href: 'mailto:info@pablothegarden.com',
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      label: t('direct_instagram'),
      value: '@pablo_thegarden',
      href: 'https://instagram.com/pablo_thegarden',
      icon: (
        <svg
          className="h-5 w-5"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      ),
      external: true,
    },
    {
      label: t('direct_location'),
      value: t('direct_location_value'),
      href: 'https://maps.google.com/?q=Morrovalle+MC+Italy',
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      external: true,
    },
  ];

  return (
    <div className="rounded-candy bg-surface-elevated p-6 shadow-candy sm:p-8">
      <h2 className="mb-6 font-display text-xl font-bold text-night-purple">
        {t('direct_contact_title')}
      </h2>

      <ul className="space-y-5">
        {contacts.map((contact) => (
          <li key={contact.label}>
            <a
              href={contact.href}
              target={contact.external ? '_blank' : undefined}
              rel={contact.external ? 'noopener noreferrer' : undefined}
              className="group flex items-start gap-4 transition-colors"
            >
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-candy-pink/10 text-candy-pink transition-colors group-hover:bg-candy-pink group-hover:text-white">
                {contact.icon}
              </span>
              <div>
                <span className="block text-sm font-medium text-text-primary/60">
                  {contact.label}
                </span>
                <span className="block text-text-primary transition-colors group-hover:text-candy-pink">
                  {contact.value}
                </span>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
