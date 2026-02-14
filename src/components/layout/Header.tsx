'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Navigation from './Navigation';
import LanguageSwitcher from './LanguageSwitcher';
import type { NavItem } from './Navigation';

export default function Header() {
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');
  const tA11y = useTranslations('accessibility');

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navItems: NavItem[] = [
    { href: '/lineup', label: t('lineup') },
    { href: '/tickets', label: t('tickets') },
    { href: '/gallery', label: t('gallery') },
    { href: '/blog', label: t('blog') },
    { href: '/about', label: t('about') },
  ];

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close menu on escape key
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Skip to content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-candy focus:bg-candy-pink focus:px-4 focus:py-2 focus:text-white focus:shadow-candy"
      >
        {tA11y('skip_to_content')}
      </a>

      <header
        className={`
          fixed top-0 left-0 right-0 z-50
          transition-all duration-300
          ${
            scrolled
              ? 'bg-surface/95 backdrop-blur-md shadow-md'
              : 'bg-surface/80 backdrop-blur-sm'
          }
        `}
        role="banner"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between md:h-20">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 font-display text-xl font-bold text-candy-pink transition-colors hover:text-candy-pink-dark md:text-2xl"
            >
              Pablo The Garden
            </Link>

            {/* Desktop navigation */}
            <div className="hidden items-center gap-6 md:flex">
              <Navigation
                items={navItems}
                linkClassName="px-3 py-2 rounded-candy text-sm font-medium text-text-primary transition-all duration-200 hover:text-candy-pink hover:bg-candy-pink/5"
                activeLinkClassName="!text-candy-pink bg-candy-pink/10"
              />
              <LanguageSwitcher />
            </div>

            {/* Mobile hamburger button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="relative z-50 flex h-11 w-11 items-center justify-center rounded-candy text-text-primary transition-colors hover:bg-candy-pink/10 md:hidden"
              aria-label={mobileMenuOpen ? tCommon('close_menu') : tCommon('open_menu')}
              aria-expanded={mobileMenuOpen}
            >
              <div className="flex h-5 w-6 flex-col justify-between">
                <span
                  className={`block h-0.5 w-full rounded-full bg-current transition-all duration-300 ${
                    mobileMenuOpen ? 'translate-y-[9px] rotate-45' : ''
                  }`}
                />
                <span
                  className={`block h-0.5 w-full rounded-full bg-current transition-all duration-300 ${
                    mobileMenuOpen ? 'opacity-0' : ''
                  }`}
                />
                <span
                  className={`block h-0.5 w-full rounded-full bg-current transition-all duration-300 ${
                    mobileMenuOpen ? '-translate-y-[9px] -rotate-45' : ''
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-night-purple/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile menu drawer */}
      <div
        className={`
          fixed top-0 right-0 z-40 h-full w-[280px] max-w-[80vw]
          bg-surface shadow-2xl
          transition-transform duration-300 ease-in-out
          md:hidden
          ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
        role="dialog"
        aria-modal="true"
        aria-label={tCommon('open_menu')}
      >
        <div className="flex h-full flex-col px-6 pt-24 pb-8">
          <Navigation
            items={navItems}
            direction="vertical"
            onClick={() => setMobileMenuOpen(false)}
            linkClassName="block px-4 py-3 rounded-candy text-lg font-medium text-text-primary transition-all duration-200 hover:text-candy-pink hover:bg-candy-pink/5"
            activeLinkClassName="!text-candy-pink bg-candy-pink/10"
          />

          <div className="mt-auto pt-6 border-t border-candy-pink/10">
            <LanguageSwitcher className="w-full justify-center" />
          </div>
        </div>
      </div>
    </>
  );
}
