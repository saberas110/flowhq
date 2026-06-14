'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import { SelectDropdown } from '@/components/select-dropdown'
import { connectEmail, type EmailProvider } from '@/http/email.http'

const providers = [
  { label: 'Gmail', value: 'gmail' },
  { label: 'Outlook / Office 365', value: 'outlook' },
  { label: 'Yahoo Mail', value: 'yahoo' },
  { label: 'Custom IMAP/SMTP', value: 'custom' },
]

const formSchema = z
  .object({
    email: z.string().email('Please enter a valid email address.'),
    app_password: z.string().min(8, 'App password must be at least 8 characters.'),
    provider: z.enum(['gmail', 'outlook', 'yahoo', 'custom'], {
      error: (iss) =>
        iss.input === undefined ? 'Please select a provider.' : undefined,
    }),
    imap_host: z.string().optional(),
    imap_port: z.number().optional(),
    smtp_host: z.string().optional(),
    smtp_port: z.number().optional(),
    folder: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.provider === 'custom') {
        return !!data.imap_host && data.imap_host.length > 0
      }
      return true
    },
    {
      message: 'IMAP host is required for custom provider.',
      path: ['imap_host'],
    }
  )
  .refine(
    (data) => {
      if (data.provider === 'custom') {
        return !!data.smtp_host && data.smtp_host.length > 0
      }
      return true
    },
    {
      message: 'SMTP host is required for custom provider.',
      path: ['smtp_host'],
    }
  )

type ConnectEmailForm = z.infer<typeof formSchema>

type ConnectEmailDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ConnectEmailDialog({
  open,
  onOpenChange,
  onSuccess,
}: ConnectEmailDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ConnectEmailForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      app_password: '',
      provider: 'gmail',
      imap_host: '',
      imap_port: 993,
      smtp_host: '',
      smtp_port: 587,
      folder: 'INBOX',
    },
  })

  const selectedProvider = form.watch('provider')
  const isCustomProvider = selectedProvider === 'custom'

  const onSubmit = async (values: ConnectEmailForm) => {
    setIsLoading(true)

    try {
      const payload = {
        email: values.email,
        app_password: values.app_password,
        provider: values.provider as EmailProvider,
        ...(isCustomProvider && {
          imap_host: values.imap_host,
          imap_port: values.imap_port,
          smtp_host: values.smtp_host,
          smtp_port: values.smtp_port,
        }),
        folder: values.folder || 'INBOX',
      }

      await connectEmail(payload)

      toast.success('Email connected successfully!')
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      console.error('Connect email error:', error)
      const message =
        error.response?.data?.error ||
        error.response?.data?.details ||
        'Failed to connect email. Please check your credentials.'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!isLoading) {
          form.reset()
          onOpenChange(state)
        }
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>Connect Email Account</DialogTitle>
          <DialogDescription>
            Connect your email account using IMAP/SMTP. You&apos;ll need an app
            password for secure access.
          </DialogDescription>
        </DialogHeader>
        <div className='max-h-[24rem] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='connect-email-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
            >
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='you@example.com'
                        className='col-span-4'
                        autoComplete='email'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='app_password'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      App Password
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder='Your app password'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='provider'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Provider
                    </FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Select provider'
                      className='col-span-4'
                      items={providers}
                      isControlled
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />

              {isCustomProvider && (
                <>
                  <FormField
                    control={form.control}
                    name='imap_host'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-2 text-end'>
                          IMAP Host
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='imap.example.com'
                            className='col-span-4'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className='col-span-4 col-start-3' />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='imap_port'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-2 text-end'>
                          IMAP Port
                        </FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            placeholder='993'
                            className='col-span-4'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className='col-span-4 col-start-3' />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='smtp_host'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-2 text-end'>
                          SMTP Host
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='smtp.example.com'
                            className='col-span-4'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className='col-span-4 col-start-3' />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='smtp_port'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-2 text-end'>
                          SMTP Port
                        </FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            placeholder='587'
                            className='col-span-4'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className='col-span-4 col-start-3' />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={form.control}
                name='folder'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Folder</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='INBOX'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type='submit' form='connect-email-form' disabled={isLoading}>
            {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Connect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
