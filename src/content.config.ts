import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const cases = defineCollection({
  loader: glob({ base: './src/content/cases', pattern: '**/*.md' }),
  schema: z
    .object({
      title: z.string(),
      titleEn: z.string().optional(),
      category: z.string().optional(),
      sector: z.string().optional(),
      services: z.array(z.string()).default([]),
      cover: z.string().optional(),
      alt: z.string().optional(),
      home: z.boolean().default(true),
      order: z.number().default(100),
      client: z.string().optional(),
      year: z.string().optional(),
      descriptionEn: z.string().optional(),
      placeholder: z.boolean().default(false),
    })
    .superRefine((entry, context) => {
      if (entry.placeholder) return;

      const requiredFields = {
        titleEn: entry.titleEn,
        category: entry.category,
        sector: entry.sector,
        cover: entry.cover,
        alt: entry.alt,
        client: entry.client,
        descriptionEn: entry.descriptionEn,
      };

      for (const [field, value] of Object.entries(requiredFields)) {
        if (!value?.trim()) {
          context.addIssue({
            code: 'custom',
            path: [field],
            message: `${field} is required for complete cases`,
          });
        }
      }
    }),
});

export const collections = { cases };
