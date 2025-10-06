import { Trash } from 'lucide-react'
import { type Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { type Article } from '../data/schema'

type DataTableBulkActionsProps = {
  table: Table<Article>
}

export function DataTableBulkActions({ table }: DataTableBulkActionsProps) {
  const selectedRows = table.getFilteredSelectedRowModel().rows

  if (selectedRows.length === 0) return null

  const onDelete = () => {
    const ids = selectedRows.map((row) => row.original.id)
    showSubmittedData({ action: 'bulk-delete', ids })
    table.toggleAllPageRowsSelected(false)
  }

  return (
    <div className='fixed inset-x-0 bottom-4 z-50 mx-auto w-fit px-4'>
      <div className='w-full overflow-x-auto'>
        <div className='mx-auto flex w-fit items-center gap-2 rounded-md border bg-card p-4 shadow-2xl'>
          <div className='flex h-7 items-center rounded-md border border-dashed ps-2.5 pe-3'>
            <span className='whitespace-nowrap text-xs'>
              {selectedRows.length} selected
            </span>
          </div>
          <Button 
            variant='outline' 
            className='h-7 gap-2' 
            size='sm'
            onClick={onDelete}
          >
            <Trash className='h-4 w-4' />
            Delete ({selectedRows.length})
          </Button>
        </div>
      </div>
    </div>
  )
}

