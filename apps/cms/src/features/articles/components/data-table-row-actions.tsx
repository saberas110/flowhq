import { Edit, MoreHorizontal, Trash } from 'lucide-react'
import { type CellContext } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type Article } from '../data/schema'
import { useArticlesStore } from '../stores/articles-store'

export function DataTableRowActions({
  row,
}: CellContext<Article, unknown>) {
  const { openEditDialog, openDeleteDialog } = useArticlesStore()

  const onEdit = () => {
    openEditDialog(row.original)
  }

  const onDelete = () => {
    openDeleteDialog(row.original)
  }

  return (
    <div className='text-end'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
          >
            <MoreHorizontal className='h-4 w-4' />
            <span className='sr-only'>Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[160px]'>
          <DropdownMenuItem onClick={onEdit}>
            <Edit className='me-2 h-3.5 w-3.5 text-muted-foreground/70' />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onDelete}>
            <Trash className='me-2 h-3.5 w-3.5 text-muted-foreground/70' />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

