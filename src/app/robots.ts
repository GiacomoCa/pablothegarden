import { MetadataRoute } from 'next';

const baseUrl = 'https://pablothegarden.com';

// AI / answer-engine crawlers we explicitly welcome so the festival can be
// cited in AI-generated answers (ChatGPT, Claude, Perplexity, Google AI, etc.)
const aiCrawlers = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-Web',
  'Anthropic-AI',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'Amazonbot',
  'CCBot',
  'Bytespider',
  'Meta-ExternalAgent',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: aiCrawlers, allow: '/' },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
