import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    author: z.string().default('Jinki Team'),
    image: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

const annotation = z.object({
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
  label: z.string(),
  confidence: z.number().optional(),
  labelAt: z.enum(['top', 'bottom']).optional(),
});

const stat = z.object({
  value: z.string(),
  suffix: z.string().optional(),
  label: z.string(),
  source: z.string().optional(),
});

const faq = z.object({ q: z.string(), a: z.string() });

const verticals = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/verticals' }),
  schema: z.object({
    title: z.string(),
    index: z.string(),                 // "01"
    order: z.number(),
    metaTitle: z.string(),
    metaDescription: z.string(),
    ogImage: z.string(),
    theme: z.enum(['dark', 'light']).optional(),
    hero: z.object({
      kicker: z.string(),              // mono eyebrow, e.g. "DATA CENTERS // NOVA CORRIDOR"
      headline: z.string(),            // may contain ONE <em> span for the signal word
      sub: z.string(),
      datum: z.string(),               // folio datum, e.g. "±0.5°C"
    }),
    // Optional: verticals without aerial photography yet (maritime) render
    // a drawn chart hero instead of the InspectionInstrument.
    frame: z.object({
      caption: z.string(),             // must include DEMONSTRATION ANALYSIS
      alt: z.string(),
      annotations: z.array(annotation).default([]),
    }).optional(),
    stats: z.array(stat).min(3).max(4),
    problems: z.array(z.object({
      tag: z.string(),                 // mono label, e.g. "FAILURE MODE"
      title: z.string(),
      body: z.string(),
    })).min(3).max(6),
    capabilities: z.array(z.object({
      title: z.string(),
      body: z.string(),
      datum: z.string().optional(),
    })).min(4).max(6),
    midCta: z.object({ title: z.string(), body: z.string().optional() }),
    faqs: z.array(faq).min(3).max(8),
    serviceType: z.string(),           // JSON-LD serviceType
  }),
});

const services = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/services' }),
  schema: z.object({
    title: z.string(),
    index: z.string(),
    order: z.number(),
    metaTitle: z.string(),
    metaDescription: z.string(),
    ogImage: z.string(),
    hero: z.object({
      kicker: z.string(),
      headline: z.string(),
      sub: z.string(),
      datum: z.string(),
    }),
    specs: z.array(z.object({ key: z.string(), value: z.string() })).min(4).max(8),
    stats: z.array(stat).min(3).max(4),
    deliverables: z.array(z.object({
      tag: z.string(),
      title: z.string(),
      body: z.string(),
    })).min(3).max(6),
    process: z.array(z.object({
      title: z.string(),
      sub: z.string(),
      mono: z.string().optional(),
    })).min(3).max(6),
    midCta: z.object({ title: z.string(), body: z.string().optional() }),
    faqs: z.array(faq).min(3).max(8),
    serviceType: z.string(),
  }),
});

export const collections = { blog, verticals, services };
