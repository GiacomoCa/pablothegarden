'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

function InfoCard({ icon, title, description, index }: InfoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.55 + index * 0.1 }}
      className="flex gap-4 rounded-candy bg-surface-elevated p-5 shadow-sm transition-shadow duration-300 hover:shadow-candy"
    >
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-candy-pink/10 text-candy-pink"
        aria-hidden="true"
      >
        {icon}
      </div>
      <div>
        <h3 className="font-display text-base font-bold text-text-primary">
          {title}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-text-primary/70">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

export default function PracticalInfo() {
  const t = useTranslations('tickets');

  const items = [
    {
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
          />
        </svg>
      ),
      title: t('practical_drink_card_title'),
      description: t('practical_drink_card_description'),
    },
    {
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
          />
        </svg>
      ),
      title: t('practical_age_title'),
      description: t('practical_age_description'),
    },
    {
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z"
          />
        </svg>
      ),
      title: t('practical_wristband_title'),
      description: t('practical_wristband_description'),
    },
  ];

  return (
    <section className="mx-auto w-full max-w-4xl px-4">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mb-8 text-center font-display text-2xl font-bold text-text-primary sm:text-3xl"
      >
        {t('practical_info_title')}
      </motion.h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <InfoCard
            key={index}
            icon={item.icon}
            title={item.title}
            description={item.description}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}
