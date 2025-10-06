import { z } from 'zod'
import type { IArticleResponseDto } from '@repo/shared/dtos'

/**
 * Frontend Article type extends the shared DTO
 * Only difference: dates are transformed to Date objects for easier manipulation
 */
export type Article = Omit<IArticleResponseDto, 'createdAt' | 'publishedAt'> & {
  createdAt: Date
  publishedAt: Date | null
}

/**
 * Re-export shared types for convenience
 */

/**
 * Zod schemas for runtime validation (forms, query params, etc.)
 * NOT for API response types - use shared DTOs for that
 */

// Article status enum for filtering
export const articleStatusSchema = z.union([
  z.literal('published'),
  z.literal('draft'),
])
export type ArticleStatus = z.infer<typeof articleStatusSchema>

// Form validation schema for creating/editing articles
export const articleFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().min(1, 'Excerpt is required'),
  metaDescription: z.string().min(1, 'Meta description is required'),
  imageAlt: z.string().min(1, 'Image alt text is required'),
  imageSrc: z.string().url('Must be a valid URL'),
  tags: z.string().min(1, 'At least one tag is required'),
  published: z.boolean(),
})
export type ArticleFormData = z.infer<typeof articleFormSchema>

// Query filter schema for URL search params
export const articleFilterSchema = z.object({
  published: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().optional(),
})
