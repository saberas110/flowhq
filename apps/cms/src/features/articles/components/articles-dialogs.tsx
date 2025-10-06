import { ArticlesActionDialog } from './articles-action-dialog'
import { ArticlesDeleteDialog } from './articles-delete-dialog'
import { useArticlesStore } from '../stores/articles-store'

export function ArticlesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useArticlesStore()
  return (
    <>
      <ArticlesActionDialog
        key='article-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <ArticlesActionDialog
            key={`article-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <ArticlesDeleteDialog
            key={`article-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}

