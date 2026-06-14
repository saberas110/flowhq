'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { type Article } from '../data/schema'
import { useDeleteArticleMutation } from '../hooks/use-articles-query'

type ArticleDeleteDialogProps = {
  currentRow: Article
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ArticlesDeleteDialog({
  currentRow,
  open,
  onOpenChange,
}: ArticleDeleteDialogProps) {
  const deleteMutation = useDeleteArticleMutation()

  const onDelete = () => {
    deleteMutation.mutate(currentRow.id, {
      onSuccess: () => {
        onOpenChange(false)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This will permanently delete the article{' '}
            <span className='font-semibold'>&quot;{currentRow.title}&quot;</span>
            . This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant='destructive'
            onClick={onDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

