'use client'

import {zodResolver} from "@hookform/resolvers/zod"
import { z } from "zod"




export const sendEmailSchema = z.object({
    from_email: z.string().email(),
    // to_email: z.string().email(),
    subject: z.string().min(1),
    html_body: z.string().min(1),
    cc_email: z.string().email().optional(),
    bcc_email: z.string().email().optional(),
    service_account_id: z.coerce.number().min(1),
})

export type TSendEmailSchema = z.infer<typeof sendEmailSchema>
export const sendEmailResolver = zodResolver(sendEmailSchema)




export const sendWhatsAppSchema = z.object({
    text: z.string().min(1),
    service_account_id: z.coerce.number().min(1)
})

export type TSendWhatsAppSchema = z.infer<typeof sendEmailSchema>
export const sendWhatsAppResolver = zodResolver(sendWhatsAppSchema)