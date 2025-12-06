'use client'

import {CardContent, CardFooter} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {useForm} from "react-hook-form";
import {loginresolver, TLoginFormValues} from "@flowhq/shared";
import {useState} from "react";
import {loginUser} from "@/http/auth/userApi";
import {useRouter} from "next/navigation";
import {AxiosError} from 'axios'
import  {type TResError } from '@flowhq/shared'



export default function UserLoginForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const {register, handleSubmit, formState: {errors}} = useForm({resolver: loginresolver})

    const onSubmit = async (data: TLoginFormValues) => {
        await loginUser(data)
            .then(res => {
                console.log('response is ', res)
                router.push('/dashboard')
            }).catch((err: AxiosError<TResError>) => {
                console.log(err.response)
            })
    }

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            {...register("email")}
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"

                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            {...register("password")}
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                        />
                    </div>
                    {Object.keys(errors).length > 0 || error && (
                        <div className="my-3 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                            {error}

                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Signing in..." : "Sign in"}
                    </Button>

                    <Button className="" variant="link">
                        <Link href={process.env.NEXT_PUBLIC_GOOGLE_LOGIN_URL!}>
                            Sign in with Google
                        </Link>
                    </Button>

                    <p className="text-sm text-center text-gray-600">
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/register"
                            className="text-blue-600 hover:underline font-medium"
                        >
                            Create one
                        </Link>
                    </p>
                </CardFooter>
            </form>

        </>
    )

}