import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-pink-500 mb-4">
          {t('hero.title')}
        </h1>
        <p className="text-2xl text-orange-400 mb-2">
          {t('hero.subtitle')}
        </p>
        <p className="text-lg text-gray-600 mb-1">
          {t('hero.dates')}
        </p>
        <p className="text-lg text-gray-600 mb-8">
          {t('hero.location')}
        </p>
        <div className="flex gap-4 justify-center">
          <button className="rounded-full bg-pink-500 px-6 py-3 text-white font-semibold hover:bg-pink-600 transition-colors">
            {t('hero.cta_tickets')}
          </button>
          <button className="rounded-full border-2 border-pink-500 px-6 py-3 text-pink-500 font-semibold hover:bg-pink-50 transition-colors">
            {t('hero.cta_lineup')}
          </button>
        </div>
      </div>
    </main>
  );
}
