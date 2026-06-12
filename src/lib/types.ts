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

/**
 * A single animated festival statistic (e.g. "15.000+ Attendees")
 */
export interface FestivalStat {
  value: number;
  label_it: string;
  label_en: string;
  prefix?: string;
  suffix?: string;
}

/**
 * "Sweet World" homepage section content, parsed from markdown frontmatter + body
 */
export interface SweetWorldContent {
  heading: string;
  subtitle: string;
  ctaLabel: string;
  ctaUrl: string;
  images: string[];
  body: string;
}

/**
 * A single artist within a day-grouped lineup (homepage lineup section)
 */
export interface LineupDayArtist {
  name: string;
  revealed: boolean;
  /** Special role tag: closing set or hip-hop set */
  tag?: 'closing' | 'hiphop';
  /** Plays on the second stage ("Seconda Sala") */
  secondStage?: boolean;
  /** Optional artist photo path (placeholder until provided) */
  photo?: string;
}

/**
 * Lineup grouped by festival day (1 = Aug 15, 2 = Aug 16)
 */
export interface LineupDayGroup {
  day: 1 | 2;
  artists: LineupDayArtist[];
}

/**
 * A purchase card shown in the homepage tickets section (5 cards over 2 rows)
 */
export interface HomeTicket {
  id: string;
  title: { it: string; en: string };
  release: { it: string; en: string };
  status: 'available' | 'sold_out' | 'coming_soon';
  price?: number | null;
  url?: string;
  image?: string;
  /** Layout row: 1 (top, the two-day passes) or 2 (bottom, third release) */
  row: 1 | 2;
}
