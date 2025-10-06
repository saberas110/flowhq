import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createArticle,
  deleteArticle,
  getAllArticles,
  getAllTags,
  updateArticle,
} from '@/http/article.http'
import type { ICreateArticleDto, IUpdateArticleDto } from '@repo/shared/dtos'

const QUERY_KEY = 'articles'
const TAGS_QUERY_KEY = 'article-tags'

export function useArticlesQuery(published?: boolean) {
  return useQuery({
    queryKey: [QUERY_KEY, published],
    queryFn: () => getAllArticles(published),
  })
}

export function useCreateArticleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ICreateArticleDto) => createArticle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [TAGS_QUERY_KEY] })
      toast.success('Article created successfully')
    },
  })
}

export function useUpdateArticleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: IUpdateArticleDto }) =>
      updateArticle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [TAGS_QUERY_KEY] })
      toast.success('Article updated successfully')
    },
  })
}

export function useDeleteArticleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteArticle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [TAGS_QUERY_KEY] })
      toast.success('Article deleted successfully')
    },
  })
}

export function useArticleTagsQuery() {
  return useQuery({
    queryKey: [TAGS_QUERY_KEY],
    queryFn: getAllTags,
    staleTime: 5 * 60 * 1000, // 5 minutes - tags don't change often
  })
}

