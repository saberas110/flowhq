import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Articles } from '@/features/articles'

const articlesSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  // Facet filters
  published: z
    .array(z.union([z.literal(true), z.literal(false)]))
    .optional()
    .catch([]),
  tags: z.array(z.string()).optional().catch([]),
  // Per-column text filter
  title: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/articles/')({
  validateSearch: articlesSearchSchema,
  component: Articles,
})

