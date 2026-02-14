import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type {
  Artist,
  LineupConfig,
  TicketConfig,
  Sponsor,
  BlogPost,
  FAQ,
  GalleryEdition,
} from './types';

// =============================================================================
// Content directory root
// =============================================================================

const contentDir = path.join(process.cwd(), 'content');

// =============================================================================
// Internal helpers
// =============================================================================

/**
 * Safely read and parse a JSON file. Returns `null` if the file does not exist.
 */
function readJsonFile<T>(filePath: string): T | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Safely read a text/markdown file. Returns `null` if the file does not exist.
 */
function readTextFile(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

/**
 * List all files with a given extension inside a directory.
 * Returns an empty array if the directory does not exist.
 */
function listFiles(dirPath: string, extension: string): string[] {
  try {
    return fs
      .readdirSync(dirPath)
      .filter((f) => f.endsWith(extension))
      .map((f) => path.join(dirPath, f));
  } catch {
    return [];
  }
}

// =============================================================================
// Lineup
// =============================================================================

/**
 * Read the lineup reveal-phase configuration.
 */
export function getLineupConfig(): LineupConfig {
  const filePath = path.join(contentDir, 'lineup', 'config.json');
  const data = readJsonFile<LineupConfig>(filePath);

  if (!data) {
    return {
      phase: 'coming_soon',
      totalSlots: 0,
      newBadgeDays: 7,
      comingSoonMessage: { it: '', en: '' },
      mysteryCardMessage: { it: '', en: '' },
    };
  }

  return data;
}

/**
 * Read all artist markdown files from `content/lineup/`.
 * Each `.md` file (except `config.json`) is parsed via gray-matter.
 * Artists are returned sorted by `order`.
 */
export function getLineup(): Artist[] {
  const lineupDir = path.join(contentDir, 'lineup');
  const files = listFiles(lineupDir, '.md');

  const artists: Artist[] = files.map((filePath) => {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(raw);

    return {
      name: (data.name as string) ?? '',
      slug: (data.slug as string) ?? path.basename(filePath, '.md'),
      day: (data.day as 1 | 2) ?? 1,
      time: (data.time as string) ?? '',
      genre: (data.genre as string) ?? '',
      photo: (data.photo as string) ?? '',
      bio: content.trim() || ((data.bio as string) ?? ''),
      revealed: (data.revealed as boolean) ?? false,
      revealDate: (data.revealDate as string) ?? '',
      order: (data.order as number) ?? 0,
      social: {
        instagram: (data.social?.instagram as string) ?? '',
        spotify: (data.social?.spotify as string) ?? '',
        soundcloud: (data.social?.soundcloud as string) ?? '',
      },
    };
  });

  return artists.sort((a, b) => a.order - b.order);
}

// =============================================================================
// Tickets
// =============================================================================

/**
 * Read the full ticket configuration.
 */
export function getTickets(): TicketConfig {
  const filePath = path.join(contentDir, 'tickets.json');
  const data = readJsonFile<TicketConfig>(filePath);

  if (!data) {
    return {
      activeRelease: '',
      releases: {
        earlybird: {
          label: { it: '', en: '' },
          description: { it: '', en: '' },
          status: 'coming_soon',
          tickets: {
            fullpass: { label: { it: '', en: '' }, price: 0, currency: 'EUR', status: 'coming_soon', url: '' },
            day1: { label: { it: '', en: '' }, price: 0, currency: 'EUR', status: 'coming_soon', url: '' },
            day2: { label: { it: '', en: '' }, price: 0, currency: 'EUR', status: 'coming_soon', url: '' },
          },
        },
        promo: {
          label: { it: '', en: '' },
          description: { it: '', en: '' },
          status: 'coming_soon',
          tickets: {
            fullpass: { label: { it: '', en: '' }, price: 0, currency: 'EUR', status: 'coming_soon', url: '' },
            day1: { label: { it: '', en: '' }, price: 0, currency: 'EUR', status: 'coming_soon', url: '' },
            day2: { label: { it: '', en: '' }, price: 0, currency: 'EUR', status: 'coming_soon', url: '' },
          },
        },
        regular: {
          label: { it: '', en: '' },
          description: { it: '', en: '' },
          status: 'coming_soon',
          tickets: {
            fullpass: { label: { it: '', en: '' }, price: 0, currency: 'EUR', status: 'coming_soon', url: '' },
            day1: { label: { it: '', en: '' }, price: 0, currency: 'EUR', status: 'coming_soon', url: '' },
            day2: { label: { it: '', en: '' }, price: 0, currency: 'EUR', status: 'coming_soon', url: '' },
          },
        },
      },
    };
  }

  return data;
}

// =============================================================================
// Sponsors
// =============================================================================

/**
 * Read the sponsors list. Returns an empty array if the file doesn't exist yet.
 */
export function getSponsors(): Sponsor[] {
  const filePath = path.join(contentDir, 'sponsors', 'sponsors.json');
  return readJsonFile<Sponsor[]>(filePath) ?? [];
}

// =============================================================================
// Blog
// =============================================================================

/**
 * Read all blog posts for a given locale, sorted by date descending.
 */
export function getBlogPosts(locale: string): BlogPost[] {
  const blogDir = path.join(contentDir, 'blog', locale);
  const files = listFiles(blogDir, '.mdx');

  const posts: BlogPost[] = files.map((filePath) => {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(raw);
    const slug = path.basename(filePath, '.mdx');

    return {
      title: (data.title as string) ?? '',
      date: (data.date as string) ?? '',
      excerpt: (data.excerpt as string) ?? '',
      image: (data.image as string) ?? '',
      tags: (data.tags as string[]) ?? [],
      locale,
      slug,
      content,
    };
  });

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/**
 * Read a single blog post by slug and locale.
 */
export function getBlogPost(slug: string, locale: string): BlogPost | null {
  const filePath = path.join(contentDir, 'blog', locale, `${slug}.mdx`);
  const raw = readTextFile(filePath);

  if (!raw) return null;

  const { data, content } = matter(raw);

  return {
    title: (data.title as string) ?? '',
    date: (data.date as string) ?? '',
    excerpt: (data.excerpt as string) ?? '',
    image: (data.image as string) ?? '',
    tags: (data.tags as string[]) ?? [],
    locale,
    slug,
    content,
  };
}

// =============================================================================
// Rules
// =============================================================================

/**
 * Read the rules markdown for the given locale.
 * Returns an empty string if the file doesn't exist yet.
 */
export function getRules(locale: string): string {
  const filePath = path.join(contentDir, 'rules', `${locale}.md`);
  return readTextFile(filePath) ?? '';
}

// =============================================================================
// About
// =============================================================================

/**
 * Read the about page markdown for the given locale.
 * Returns an empty string if the file doesn't exist yet.
 */
export function getAbout(locale: string): string {
  const filePath = path.join(contentDir, 'about', `${locale}.md`);
  return readTextFile(filePath) ?? '';
}

// =============================================================================
// FAQ
// =============================================================================

/**
 * Read the FAQ entries for the given locale.
 * Returns an empty array if the file doesn't exist yet.
 */
export function getFaq(locale: string): FAQ[] {
  const filePath = path.join(contentDir, 'faq', `${locale}.json`);
  return readJsonFile<FAQ[]>(filePath) ?? [];
}

// =============================================================================
// Gallery
// =============================================================================

/**
 * Read gallery edition data. Returns an empty array if the file doesn't exist yet.
 */
export function getGallery(): GalleryEdition[] {
  const filePath = path.join(contentDir, 'gallery.json');
  return readJsonFile<GalleryEdition[]>(filePath) ?? [];
}
