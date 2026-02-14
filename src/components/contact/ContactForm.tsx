'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

interface FormErrors {
  name?: string;
  email?: string;
  type?: string;
  message?: string;
}

const FORMSPREE_URL = 'https://formspree.io/f/placeholder';

const REQUEST_TYPES = ['sponsor', 'media', 'vendor', 'other'] as const;

export default function ContactForm() {
  const t = useTranslations('contact');

  const [formState, setFormState] = useState<FormState>('idle');
  const [errors, setErrors] = useState<FormErrors>({});

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [requestType, setRequestType] = useState('');
  const [message, setMessage] = useState('');

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = t('form_validation_name');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      newErrors.email = t('form_validation_email');
    }

    if (!requestType) {
      newErrors.type = t('form_validation_type');
    }

    if (!message.trim()) {
      newErrors.message = t('form_validation_message');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, email, requestType, message, t]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) return;

    setFormState('submitting');

    try {
      const response = await fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          company: company.trim(),
          type: requestType,
          message: message.trim(),
        }),
      });

      if (response.ok) {
        setFormState('success');
        setName('');
        setEmail('');
        setCompany('');
        setRequestType('');
        setMessage('');
        setErrors({});
      } else {
        setFormState('error');
      }
    } catch {
      setFormState('error');
    }
  };

  // Success state
  if (formState === 'success') {
    return (
      <div
        className="rounded-candy border-2 border-mint-green/30 bg-mint-green/10 p-8 text-center"
        role="status"
        aria-live="polite"
      >
        <div className="mb-3 text-4xl" aria-hidden="true">
          {'\u2705'}
        </div>
        <h3 className="font-display text-xl font-bold text-text-primary">
          {t('form_success_title')}
        </h3>
        <p className="mt-2 text-text-primary/70">{t('form_success')}</p>
        <button
          type="button"
          onClick={() => setFormState('idle')}
          className="mt-6 inline-flex items-center rounded-pill bg-candy-pink px-6 py-2.5 font-medium text-white transition-colors hover:bg-candy-pink-dark"
        >
          {t('form_submit')}
        </button>
      </div>
    );
  }

  // Error state (shown above the form)
  const errorBanner = formState === 'error' && (
    <div
      className="mb-6 rounded-candy border-2 border-candy-pink-dark/30 bg-candy-pink-dark/10 p-4"
      role="alert"
      aria-live="assertive"
    >
      <h3 className="font-display font-bold text-candy-pink-dark">
        {t('form_error_title')}
      </h3>
      <p className="mt-1 text-sm text-text-primary/70">{t('form_error')}</p>
    </div>
  );

  return (
    <div>
      {errorBanner}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Name */}
        <div>
          <label
            htmlFor="contact-name"
            className="mb-1.5 block text-sm font-medium text-text-primary"
          >
            {t('form_name')} <span className="text-candy-pink">*</span>
          </label>
          <input
            id="contact-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            placeholder={t('form_name_placeholder')}
            className={`w-full rounded-candy border-2 bg-surface px-4 py-3 text-text-primary transition-colors placeholder:text-text-primary/40 focus:outline-none focus:ring-2 focus:ring-candy-pink/30 ${
              errors.name ? 'border-candy-pink-dark' : 'border-candy-pink/20 focus:border-candy-pink'
            }`}
            aria-invalid={errors.name ? 'true' : undefined}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p id="name-error" className="mt-1 text-sm text-candy-pink-dark" role="alert">
              {errors.name}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="contact-email"
            className="mb-1.5 block text-sm font-medium text-text-primary"
          >
            {t('form_email')} <span className="text-candy-pink">*</span>
          </label>
          <input
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            placeholder={t('form_email_placeholder')}
            className={`w-full rounded-candy border-2 bg-surface px-4 py-3 text-text-primary transition-colors placeholder:text-text-primary/40 focus:outline-none focus:ring-2 focus:ring-candy-pink/30 ${
              errors.email ? 'border-candy-pink-dark' : 'border-candy-pink/20 focus:border-candy-pink'
            }`}
            aria-invalid={errors.email ? 'true' : undefined}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-sm text-candy-pink-dark" role="alert">
              {errors.email}
            </p>
          )}
        </div>

        {/* Company (optional) */}
        <div>
          <label
            htmlFor="contact-company"
            className="mb-1.5 block text-sm font-medium text-text-primary"
          >
            {t('form_company')}
          </label>
          <input
            id="contact-company"
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder={t('form_company_placeholder')}
            className="w-full rounded-candy border-2 border-candy-pink/20 bg-surface px-4 py-3 text-text-primary transition-colors placeholder:text-text-primary/40 focus:border-candy-pink focus:outline-none focus:ring-2 focus:ring-candy-pink/30"
          />
        </div>

        {/* Request Type */}
        <div>
          <label
            htmlFor="contact-type"
            className="mb-1.5 block text-sm font-medium text-text-primary"
          >
            {t('form_type')} <span className="text-candy-pink">*</span>
          </label>
          <select
            id="contact-type"
            value={requestType}
            onChange={(e) => {
              setRequestType(e.target.value);
              if (errors.type) setErrors((prev) => ({ ...prev, type: undefined }));
            }}
            className={`w-full appearance-none rounded-candy border-2 bg-surface px-4 py-3 text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-candy-pink/30 ${
              !requestType ? 'text-text-primary/40' : ''
            } ${
              errors.type ? 'border-candy-pink-dark' : 'border-candy-pink/20 focus:border-candy-pink'
            }`}
            aria-invalid={errors.type ? 'true' : undefined}
            aria-describedby={errors.type ? 'type-error' : undefined}
          >
            <option value="" disabled>
              {t('form_type_placeholder')}
            </option>
            {REQUEST_TYPES.map((type) => (
              <option key={type} value={type}>
                {t(`form_type_${type}`)}
              </option>
            ))}
          </select>
          {errors.type && (
            <p id="type-error" className="mt-1 text-sm text-candy-pink-dark" role="alert">
              {errors.type}
            </p>
          )}
        </div>

        {/* Message */}
        <div>
          <label
            htmlFor="contact-message"
            className="mb-1.5 block text-sm font-medium text-text-primary"
          >
            {t('form_message')} <span className="text-candy-pink">*</span>
          </label>
          <textarea
            id="contact-message"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (errors.message) setErrors((prev) => ({ ...prev, message: undefined }));
            }}
            placeholder={t('form_message_placeholder')}
            rows={5}
            className={`w-full resize-y rounded-candy border-2 bg-surface px-4 py-3 text-text-primary transition-colors placeholder:text-text-primary/40 focus:outline-none focus:ring-2 focus:ring-candy-pink/30 ${
              errors.message ? 'border-candy-pink-dark' : 'border-candy-pink/20 focus:border-candy-pink'
            }`}
            aria-invalid={errors.message ? 'true' : undefined}
            aria-describedby={errors.message ? 'message-error' : undefined}
          />
          {errors.message && (
            <p id="message-error" className="mt-1 text-sm text-candy-pink-dark" role="alert">
              {errors.message}
            </p>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={formState === 'submitting'}
          className="inline-flex w-full items-center justify-center rounded-pill bg-candy-pink px-8 py-4 font-display text-base font-bold text-white shadow-candy transition-all duration-200 hover:bg-candy-pink-dark hover:shadow-candy-hover disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {formState === 'submitting' ? (
            <>
              <svg
                className="-ml-1 mr-2 h-5 w-5 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {t('form_submitting')}
            </>
          ) : (
            t('form_submit')
          )}
        </button>
      </form>
    </div>
  );
}
