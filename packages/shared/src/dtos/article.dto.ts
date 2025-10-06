export interface IArticleImage {
  alt: string;
  src: string;
}

export interface ICreateArticleDto {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image: IArticleImage;
  metaDescription: string;
  tags: string[];
  published?: boolean;
}

export interface IUpdateArticleDto {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  image?: IArticleImage;
  metaDescription?: string;
  tags?: string[];
  published?: boolean;
}

export interface IArticleResponseDto {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image: IArticleImage;
  published: boolean;
  createdAt: string;
  publishedAt: string;
  metaDescription: string;
  tags: string[];
}

