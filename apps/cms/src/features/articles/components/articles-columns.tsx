import { type ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type Article } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const articlesColumns: ColumnDef<Article>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    meta: {
      className: cn('sticky md:table-cell start-0 z-10 rounded-tl-[inherit]'),
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Title' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-60 ps-3 font-medium'>
        {row.getValue('title')}
      </LongText>
    ),
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
        'sticky start-6 @4xl/content:table-cell @4xl/content:drop-shadow-none'
      ),
    },
    enableHiding: false,
  },
  {
    accessorKey: 'slug',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Slug' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-40 text-muted-foreground'>
        {row.getValue('slug')}
      </LongText>
    ),
  },
  {
    accessorKey: 'excerpt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Excerpt' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-64'>{row.getValue('excerpt')}</LongText>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'tags',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tags' />
    ),
    cell: ({ row }) => {
      const tags = row.getValue('tags') as string[]
      return (
        <div className='flex flex-wrap gap-1'>
          {tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant='secondary' className='capitalize'>
              {tag}
            </Badge>
          ))}
          {tags.length > 2 && (
            <Badge variant='outline' className='capitalize'>
              +{tags.length - 2}
            </Badge>
          )}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const tags = row.getValue(id) as string[]
      return value.some((v: string) => tags.includes(v))
    },
    enableSorting: false,
  },
  {
    accessorKey: 'published',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const published = row.getValue('published') as boolean
      return (
        <Badge
          variant='outline'
          className={cn(
            'capitalize',
            published
              ? 'border-green-600/50 text-green-700 dark:text-green-400'
              : 'border-yellow-600/50 text-yellow-700 dark:text-yellow-400'
          )}
        >
          {published ? 'Published' : 'Draft'}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Created At' />
    ),
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as Date
      return (
        <div className='text-nowrap'>{format(date, 'MMM dd, yyyy')}</div>
      )
    },
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]

