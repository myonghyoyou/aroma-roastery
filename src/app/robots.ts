import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// AI assistants that fetch pages to answer someone's question, and cite them: let in (GEO)
const ANSWER_BOTS = ['OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User'];
// crawlers that gather pages to train models: kept out (the user's choice, 2026-10-27). Google's
// AI answers come from the ordinary Googlebot, so blocking Google-Extended does not hide the store there.
const TRAINING_BOTS = ['GPTBot', 'ClaudeBot', 'Google-Extended', 'Applebot-Extended', 'CCBot', 'Bytespider', 'meta-externalagent', 'cohere-training-data-crawler'];

/* /robots.txt: everything public is open; the owner's pages and the site's own endpoints are not. */
export default function robots(): MetadataRoute.Robots {
  const closed = ['/admin', '/api/'];
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: closed },
      { userAgent: ANSWER_BOTS, allow: '/', disallow: closed },
      { userAgent: TRAINING_BOTS, disallow: '/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
