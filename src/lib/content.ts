import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type {
  TicketConfig,
  Sponsor,
  BlogPost,
  FAQ,
  GalleryEdition,
  FestivalStat,
  SweetWorldContent,
  LineupDayGroup,
  HomeTicket,
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
// Privacy Policy
// =============================================================================

/**
 * Read the privacy policy markdown for the given locale.
 * Returns an empty string if the file doesn't exist yet.
 */
export function getPrivacy(locale: string): string {
  const filePath = path.join(contentDir, 'privacy', `${locale}.md`);
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

// =============================================================================
// Festival Stats
// =============================================================================

/**
 * Read the animated festival statistics.
 * Returns an empty array if the file doesn't exist yet.
 */
export function getStats(): FestivalStat[] {
  const filePath = path.join(contentDir, 'stats.json');
  return readJsonFile<FestivalStat[]>(filePath) ?? [];
}

// =============================================================================
// Sweet World
// =============================================================================

/**
 * Read the "Sweet World" homepage section content for the given locale.
 * Frontmatter provides heading/subtitle/CTA/images, the body holds the narrative.
 * Returns `null` if the file doesn't exist yet.
 */
export function getSweetWorld(locale: string): SweetWorldContent | null {
  const filePath = path.join(contentDir, 'sweetworld', `${locale}.md`);
  const raw = readTextFile(filePath);

  if (!raw) return null;

  const { data, content } = matter(raw);

  return {
    heading: (data.heading as string) ?? '',
    subtitle: (data.subtitle as string) ?? '',
    ctaLabel: (data.ctaLabel as string) ?? '',
    ctaUrl: (data.ctaUrl as string) ?? '',
    images: (data.images as string[]) ?? [],
    body: content.trim(),
  };
}

// =============================================================================
// Lineup by day (homepage lineup section)
// =============================================================================

/**
 * Read the festival lineup grouped by day for the homepage section.
 * Returns an empty array if the file doesn't exist yet.
 */
export function getLineupByDay(): LineupDayGroup[] {
  const filePath = path.join(contentDir, 'lineup', 'festival-2026.json');
  return readJsonFile<LineupDayGroup[]>(filePath) ?? [];
}

// =============================================================================
// Homepage tickets section
// =============================================================================

/**
 * Read the homepage tickets cards (5 cards across 2 rows).
 * Returns an empty array if the file doesn't exist yet.
 */
export function getHomeTickets(): HomeTicket[] {
  const filePath = path.join(contentDir, 'tickets-home.json');
  return readJsonFile<HomeTicket[]>(filePath) ?? [];
}
