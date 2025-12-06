'use client'

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export const registerFormSchema = z
  .object({
    email: z.string().email().min(1),
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    password: z.string().min(7),
    confirm_password: z.string().min(7),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });
export type TRegisterFormValues = z.infer<typeof registerFormSchema>;
export const registerresolver= zodResolver(registerFormSchema)


export const loginFormSchema = z.object({
    email: z.string().email().min(1),
    password: z.string().min(7)
})

export type TLoginFormValues = z.infer<typeof loginFormSchema>
export const loginresolver = zodResolver(loginFormSchema)
