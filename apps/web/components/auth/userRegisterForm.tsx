"use client";
import { registerUser } from "@/http/auth/userApi";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import {registerresolver, TRegisterFormValues, TResError} from "@flowhq/shared";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import {AxiosError} from "axios";



export default function UserRegisterForm() {
  const router = useRouter();


  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: registerresolver });

  const [isLoading, setIsLoading] = useState(false);
  const onSubmit = async (data: TRegisterFormValues) => {
    await registerUser(data)
      .then((res) => {
        console.log("type of res", res);
        setIsLoading(true);
        router.push("/dashboard");
      })
      .catch((err:AxiosError<TResError>) => {
        console.log("error is register view", err);
      });
  };

  return (
    <>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                {...register("first_name")}
                id="first_name"
                name="first_name"
                type="text"
                placeholder="John"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                {...register("last_name")}
                id="lastName"
                name="last_name"
                type="text"
                placeholder="Doe"
                required
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              {...register("email")}
              id="email"
              name="email"
              type="email"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              {...register("password")}
              id="password"
              name="password"
              type="password"
              placeholder="Minimum 8 characters"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2 ">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              {...register("confirm_password")}
              id="confirm_password"
              name="confirm_password"
              type="password"
              placeholder="Re-enter your password"
              required
              disabled={isLoading}
            />
          </div>
          {Object.keys(errors).length > 0 && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md my-1">
              {errors.confirm_password?.message}
              {errors.last_name?.message}
              {errors.email?.message}
              {errors.password?.message}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full my-3" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
          <p className="text-sm text-center text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-blue-600 hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </>
  );
}
