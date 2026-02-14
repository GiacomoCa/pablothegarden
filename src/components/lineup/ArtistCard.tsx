'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import type { Artist } from '@/lib/types';
import NewBadge from './NewBadge';

interface ArtistCardProps {
  artist: Artist;
  isNew: boolean;
}

export default function ArtistCard({ artist, isNew }: ArtistCardProps) {
  const [expanded, setExpanded] = useState(false);
  const t = useTranslations('lineup');

  const hasSocial =
    artist.social.instagram ||
    artist.social.spotify ||
    artist.social.soundcloud;

  return (
    <motion.article
      layout
      className="relative overflow-hidden rounded-candy bg-surface shadow-candy"
      whileHover={{
        y: -6,
        boxShadow: '0 8px 30px rgba(255, 107, 157, 0.4)',
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* NEW badge */}
      {isNew && <NewBadge />}

      {/* Clickable area */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-candy-pink focus-visible:ring-offset-2 rounded-candy"
        aria-expanded={expanded}
        aria-label={
          expanded
            ? `${artist.name} — ${t('close_details')}`
            : `${artist.name} — ${t('artist_details')}`
        }
      >
        {/* Photo area */}
        <div className="relative aspect-square overflow-hidden">
          {artist.photo && artist.photo !== '/images/lineup/placeholder.jpg' ? (
            <Image
              src={artist.photo}
              alt={artist.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-candy-pink/60 via-bubblegum/40 to-night-purple/60" />
          )}

          {/* Name overlay */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-night-purple/80 to-transparent px-4 pb-3 pt-10">
            <h3 className="font-display text-lg font-bold text-white sm:text-xl">
              {artist.name}
            </h3>
          </div>
        </div>

        {/* Genre + time info */}
        <div className="flex items-center gap-2 px-4 py-3">
          <span className="inline-flex items-center rounded-pill bg-candy-pink/10 px-2.5 py-0.5 text-xs font-medium text-candy-pink">
            {artist.genre}
          </span>
          <span className="text-xs text-text-primary/60">
            {artist.time}
          </span>
        </div>
      </button>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-candy-pink/10 px-4 pb-4 pt-3">
              {/* Bio */}
              {artist.bio && artist.bio !== 'To be announced' && (
                <div className="mb-3">
                  <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-primary/50">
                    {t('bio')}
                  </h4>
                  <p className="text-sm leading-relaxed text-text-primary/80">
                    {artist.bio}
                  </p>
                </div>
              )}

              {/* Social links */}
              {hasSocial && (
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-primary/50">
                    {t('social_links')}
                  </h4>
                  <div className="flex gap-3">
                    {artist.social.instagram && (
                      <a
                        href={artist.social.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-candy-pink/10 text-candy-pink transition-colors hover:bg-candy-pink hover:text-white"
                        aria-label={`${artist.name} Instagram`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                        </svg>
                      </a>
                    )}

                    {artist.social.spotify && (
                      <a
                        href={artist.social.spotify}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-candy-pink/10 text-candy-pink transition-colors hover:bg-candy-pink hover:text-white"
                        aria-label={`${artist.name} Spotify`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                        </svg>
                      </a>
                    )}

                    {artist.social.soundcloud && (
                      <a
                        href={artist.social.soundcloud}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-candy-pink/10 text-candy-pink transition-colors hover:bg-candy-pink hover:text-white"
                        aria-label={`${artist.name} SoundCloud`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.27-2.154c-.009-.06-.05-.1-.1-.1zm-.899.828c-.06 0-.091.037-.104.094L0 14.479l.172 1.282c.013.06.045.094.104.094.058 0 .09-.037.104-.094l.205-1.282-.205-1.332c-.014-.057-.046-.094-.104-.094zm1.8-1.18c-.066 0-.12.055-.127.12l-.214 2.486.214 2.396c.008.066.061.12.127.12s.12-.054.128-.12l.242-2.396-.242-2.486c-.008-.065-.062-.12-.128-.12zm.901-.354c-.073 0-.134.06-.14.134l-.2 2.84.2 2.72c.007.074.068.134.14.134.074 0 .134-.06.142-.134l.226-2.72-.226-2.84c-.008-.074-.068-.134-.142-.134zm.899-.182c-.08 0-.148.07-.155.148l-.185 3.022.185 2.88c.007.08.075.148.155.148.08 0 .148-.068.155-.148l.21-2.88-.21-3.022c-.007-.078-.075-.148-.155-.148zm.953-.267c-.088 0-.162.075-.168.163l-.165 3.29.164 2.986c.007.087.08.161.168.161.09 0 .162-.074.17-.161l.185-2.986-.185-3.29c-.008-.088-.08-.163-.17-.163zm.952-.103c-.095 0-.175.08-.182.176l-.15 3.393.15 3.06c.007.096.087.176.182.176.094 0 .175-.08.183-.176l.17-3.06-.17-3.393c-.009-.095-.089-.176-.183-.176zm1.857-.476c-.104 0-.19.087-.197.191l-.13 3.869.13 3.148c.008.104.093.19.197.19.104 0 .19-.086.198-.19l.148-3.148-.148-3.87c-.008-.103-.094-.19-.198-.19zm.951.003c-.112 0-.204.094-.21.206l-.118 3.867.118 3.204c.006.112.098.206.21.206.112 0 .204-.094.21-.206l.134-3.204-.134-3.867c-.006-.112-.098-.206-.21-.206zm.954-.18c-.118 0-.216.1-.222.218l-.104 4.047.104 3.226c.006.12.104.218.222.218.12 0 .216-.098.222-.218l.117-3.226-.117-4.047c-.006-.12-.102-.218-.222-.218zm1.903-.493c-.013-.128-.116-.228-.244-.228-.127 0-.23.1-.243.228l-.098 4.54.098 3.244c.013.128.116.228.243.228.128 0 .231-.1.244-.228l.11-3.244-.11-4.54zm.954.117c-.13 0-.24.108-.252.24l-.076 4.422.076 3.222c.012.132.122.24.252.24.132 0 .24-.108.254-.24l.085-3.222-.085-4.422c-.014-.132-.122-.24-.254-.24zm.952-.058c-.14 0-.254.114-.265.254l-.063 4.48.063 3.222c.01.14.126.254.265.254.14 0 .255-.114.266-.254l.072-3.222-.072-4.48c-.011-.14-.126-.254-.266-.254zm2.834-.138c-.016-.154-.14-.274-.294-.274-.155 0-.278.12-.294.274l-.05 4.618.05 3.196c.016.154.139.272.294.272.154 0 .278-.118.294-.272l.057-3.196-.057-4.618zm.954-.003c-.016-.16-.148-.286-.308-.286-.16 0-.292.125-.308.286l-.037 4.621.037 3.175c.016.16.148.286.308.286.16 0 .292-.125.308-.286l.042-3.175-.042-4.621zM22.06 7.602c-.205 0-.37.166-.37.37v6.468c0 .205.165.37.37.37h1.57c.205 0 .37-.165.37-.37V10.2c0-1.44-1.17-2.598-2.61-2.598z" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
