import { create } from 'zustand'
import { type Article } from '../data/schema'

type ArticlesDialogType = 'add' | 'edit' | 'delete'

interface ArticlesState {
  open: ArticlesDialogType | null
  currentRow: Article | null
  setOpen: (type: ArticlesDialogType | null) => void
  setCurrentRow: (article: Article | null) => void
  openAddDialog: () => void
  openEditDialog: (article: Article) => void
  openDeleteDialog: (article: Article) => void
  closeDialog: () => void
}

export const useArticlesStore = create<ArticlesState>((set) => ({
  open: null,
  currentRow: null,
  setOpen: (type) => set({ open: type }),
  setCurrentRow: (article) => set({ currentRow: article }),
  openAddDialog: () => set({ open: 'add', currentRow: null }),
  openEditDialog: (article) => set({ open: 'edit', currentRow: article }),
  openDeleteDialog: (article) => set({ open: 'delete', currentRow: article }),
  closeDialog: () => set({ open: null, currentRow: null }),
}))

