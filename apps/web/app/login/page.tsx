'use client';



import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/layout/Logo';
import UserLoginForm from "@/components/auth/userLoginForm";

export default function LoginPage() {




  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <Logo />
          </div>
          <div className="space-y-2 text-center">
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>
              Sign in to your account to continue
            </CardDescription>
          </div>
        </CardHeader>
        <UserLoginForm />
      </Card>
    </div>
  );
}



