'use client';

import { useTranslations } from 'next-intl';

export default function SponsorCTA() {
  const t = useTranslations('contact');

  const scrollToForm = () => {
    const form = document.getElementById('contact-name');
    if (form) {
      form.focus();
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="rounded-candy bg-gradient-to-br from-candy-pink to-candy-pink-dark p-6 text-white shadow-candy sm:p-8">
      <h2 className="mb-3 font-display text-xl font-bold">
        {t('sponsor_cta_title')}
      </h2>
      <p className="mb-6 leading-relaxed text-white/85">
        {t('sponsor_cta_description')}
      </p>
      <button
        type="button"
        onClick={scrollToForm}
        className="inline-flex items-center rounded-pill bg-white px-6 py-2.5 font-display font-bold text-candy-pink transition-all duration-200 hover:bg-white/90 hover:shadow-lg"
      >
        {t('sponsor_cta_button')}
        <svg
          className="ml-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </div>
  );
}
