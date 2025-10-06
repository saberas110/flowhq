import { AxiosRequestConfig } from 'axios'
import { fetchData } from './axios.config'
import axiosInstance from './axios.config'
import {
  IArticleResponseDto,
  ICreateArticleDto,
  IUpdateArticleDto,
} from '@repo/shared/dtos'

export async function getAllArticles(
  published?: boolean,
  options?: AxiosRequestConfig
): Promise<IArticleResponseDto[]> {
  const params = published !== undefined ? `?published=${published}` : ''
  return fetchData<IArticleResponseDto[]>(`/articles${params}`, options)
}

export async function findArticleById(
  id: number | string
): Promise<IArticleResponseDto> {
  return fetchData<IArticleResponseDto>(`/articles/${id}`, { method: 'GET' })
}

export async function getArticleBySlug(
  slug: string
): Promise<IArticleResponseDto> {
  return fetchData<IArticleResponseDto>(`/articles/slug/${slug}`, {
    method: 'GET',
  })
}

export async function searchArticles(query: string): Promise<IArticleResponseDto[]> {
  return fetchData<IArticleResponseDto[]>(`/articles/search?q=${query}`, {
    method: 'GET',
  })
}

export async function getArticlesByTag(tag: string): Promise<IArticleResponseDto[]> {
  return fetchData<IArticleResponseDto[]>(`/articles/tag/${tag}`, {
    method: 'GET',
  })
}

export async function createArticle(
  data: ICreateArticleDto
): Promise<IArticleResponseDto> {
  const response = await axiosInstance.post<IArticleResponseDto>(
    '/articles',
    data
  )
  return response.data
}

export async function updateArticle(
  id: number,
  data: IUpdateArticleDto
): Promise<IArticleResponseDto> {
  const response = await axiosInstance.patch<IArticleResponseDto>(
    `/articles/${id}`,
    data
  )
  return response.data
}

export async function deleteArticle(id: number): Promise<void> {
  await axiosInstance.delete(`/articles/${id}`)
}

export async function getAllTags(): Promise<string[]> {
  const response = await axiosInstance.get<string[]>('/articles/tags')
  return response.data
}

