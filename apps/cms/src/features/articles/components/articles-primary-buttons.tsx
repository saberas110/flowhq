import { PenSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useArticlesStore } from '../stores/articles-store'

export function ArticlesPrimaryButtons() {
  const { openAddDialog } = useArticlesStore()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={openAddDialog}>
        <span>Add Article</span> <PenSquare size={18} />
      </Button>
    </div>
  )
}

