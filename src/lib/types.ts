// =============================================================================
// Content Type Definitions for Pablo The Garden
// =============================================================================

/**
 * Artist in the lineup
 */
export interface Artist {
  name: string;
  slug: string;
  day: 1 | 2;
  time: string;
  genre: string;
  photo: string;
  bio: string;
  revealed: boolean;
  revealDate: string;
  order: number;
  social: {
    instagram: string;
    spotify: string;
    soundcloud: string;
  };
}

/**
 * Lineup reveal phase configuration
 */
export interface LineupConfig {
  phase: 'coming_soon' | 'revealing' | 'complete';
  totalSlots: number;
  newBadgeDays: number;
  comingSoonMessage: { it: string; en: string };
  mysteryCardMessage: { it: string; en: string };
}

/**
 * A single ticket type (e.g. Full Pass, Day 1, Day 2)
 */
export interface TicketType {
  label: { it: string; en: string };
  price: number;
  currency: string;
  status: 'available' | 'sold_out' | 'coming_soon';
  url: string;
}

/**
 * A ticket release phase (Early Bird, Promo, Regular)
 */
export interface Release {
  label: { it: string; en: string };
  description: { it: string; en: string };
  status: 'active' | 'sold_out' | 'coming_soon';
  tickets: {
    fullpass: TicketType;
    day1: TicketType;
    day2: TicketType;
  };
}

/**
 * Full ticket configuration with all releases
 */
export interface TicketConfig {
  activeRelease: string;
  releases: {
    earlybird: Release;
    promo: Release;
    regular: Release;
  };
}

/**
 * Sponsor / partner entry
 */
export interface Sponsor {
  name: string;
  logo: string;
  url: string;
  tier: 'gold' | 'silver' | 'bronze';
}

/**
 * Blog post with parsed content
 */
export interface BlogPost {
  title: string;
  date: string;
  excerpt: string;
  image: string;
  tags: string[];
  locale: string;
  slug: string;
  content: string;
}

/**
 * A single FAQ entry
 */
export interface FAQ {
  question: string;
  answer: string;
}

/**
 * A single gallery image
 */
export interface GalleryImage {
  src: string;
  alt: string;
  edition: number;
  order: number;
}

/**
 * Gallery grouped by festival edition/year
 */
export interface GalleryEdition {
  year: number;
  theme: string;
  images: GalleryImage[];
}
