import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-soft-pink">
      <div className="text-center">
        <h1 className="font-display text-5xl font-bold text-candy-pink mb-4">
          {t('hero.title')}
        </h1>
        <p className="font-body text-2xl text-orange-cream mb-2">
          {t('hero.subtitle')}
        </p>
        <p className="font-body text-lg text-text-primary mb-1">
          {t('hero.dates')}
        </p>
        <p className="font-body text-lg text-text-primary mb-8">
          {t('hero.location')}
        </p>
        <div className="flex gap-4 justify-center">
          <button className="rounded-pill bg-candy-pink px-6 py-3 text-white font-semibold shadow-candy hover:bg-candy-pink-dark hover:shadow-candy-hover transition-all">
            {t('hero.cta_tickets')}
          </button>
          <button className="rounded-pill border-2 border-candy-pink px-6 py-3 text-candy-pink font-semibold hover:bg-surface-elevated transition-all">
            {t('hero.cta_lineup')}
          </button>
        </div>

        {/* Theme color swatches for visual verification */}
        <div className="mt-12 flex flex-wrap gap-3 justify-center">
          <div className="w-12 h-12 rounded-candy bg-candy-pink" title="Candy Pink" />
          <div className="w-12 h-12 rounded-candy bg-candy-pink-dark" title="Candy Pink Dark" />
          <div className="w-12 h-12 rounded-candy bg-orange-cream" title="Orange Cream" />
          <div className="w-12 h-12 rounded-candy bg-cotton-candy" title="Cotton Candy" />
          <div className="w-12 h-12 rounded-candy bg-bubblegum" title="Bubblegum" />
          <div className="w-12 h-12 rounded-candy bg-mint-green" title="Mint Green" />
          <div className="w-12 h-12 rounded-candy bg-night-purple" title="Night Purple" />
        </div>
      </div>
    </main>
  );
}
