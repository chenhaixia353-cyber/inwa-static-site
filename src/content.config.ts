import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const cases = defineCollection({
  loader: glob({ base: './src/content/cases', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    titleEn: z.string(),
    category: z.string(),
    sector: z.string(),
    services: z.array(z.string()).default([]),
    cover: z.string(),
    alt: z.string(),
    home: z.boolean().default(true),
    order: z.number().default(100),
    client: z.string(),
    year: z.string().optional(),
  }),
});

export const collections = { cases };
