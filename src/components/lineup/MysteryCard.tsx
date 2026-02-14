'use client';

import { useTranslations } from 'next-intl';

export default function MysteryCard() {
  const t = useTranslations('lineup');

  return (
    <div
      className="
        relative overflow-hidden
        flex flex-col items-center justify-center
        aspect-square
        rounded-candy
        bg-gradient-to-br from-candy-pink via-bubblegum to-night-purple
        p-6
        select-none
      "
      aria-hidden="true"
    >
      {/* Shimmer overlay */}
      <div
        className="
          pointer-events-none absolute inset-0
          animate-[shimmer_2.5s_ease-in-out_infinite]
          bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)]
          bg-[length:200%_100%]
        "
      />

      {/* Question mark icon */}
      <div
        className="
          flex h-16 w-16 items-center justify-center
          rounded-full
          bg-white/20 backdrop-blur-sm
          text-white
          mb-4
          animate-[pulse_3s_ease-in-out_infinite]
        "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-8 w-8"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 01-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 01-.837.552c-.676.37-1.028.768-1.028 1.152v.75a.75.75 0 01-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584zM12 18a.75.75 0 100-1.5.75.75 0 000 1.5z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {/* Mystery text */}
      <p className="text-center text-lg font-semibold text-white drop-shadow-md">
        {t('mystery_card')}
      </p>
    </div>
  );
}
