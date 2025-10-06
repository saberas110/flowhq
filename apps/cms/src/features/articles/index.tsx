import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ArticlesDialogs } from './components/articles-dialogs'
import { ArticlesPrimaryButtons } from './components/articles-primary-buttons'
import { ArticlesTable } from './components/articles-table'
import { useArticlesQuery } from './hooks/use-articles-query'
import { transformArticlesToDTO } from './data/utils'

const route = getRouteApi('/_authenticated/articles/')

export function Articles() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  
  // Fetch articles from API
  const { data: articlesData, isLoading, error } = useArticlesQuery()
  
  // Transform API data to match our schema
  const articles = articlesData ? transformArticlesToDTO(articlesData) : []

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Articles</h2>
            <p className='text-muted-foreground'>
              Manage your blog articles and content here.
            </p>
          </div>
          <ArticlesPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          {isLoading ? (
            <div className='flex items-center justify-center py-8'>
              <div className='text-muted-foreground'>Loading articles...</div>
            </div>
          ) : error ? (
            <div className='flex items-center justify-center py-8'>
              <div className='text-destructive'>
                Error loading articles. Please try again.
              </div>
            </div>
          ) : (
            <ArticlesTable data={articles} search={search} navigate={navigate} />
          )}
        </div>
      </Main>

      <ArticlesDialogs />
    </>
  )
}

