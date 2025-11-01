import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const posts = defineCollection({
  loader: glob({ base: "./src/posts", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    published: z.boolean(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.string().array(),
  }),
});

const experiences = defineCollection({
  loader: glob({ base: "./src/experiences", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    published: z.boolean(),
    description: z.string(),
    date: z.coerce.date(),
    company: z.string(),
    role: z.string(),
    tags: z.string().array(),
  }),
});

export const collections = { posts, experiences };
