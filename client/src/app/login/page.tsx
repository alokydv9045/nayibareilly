"use client";

import Link from "next/link";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AuthLayout from "@/components/layout/AuthLayout";
import FastLoginForm from "@/components/features/auth/FastLoginForm";
import { Shield, LogIn, Loader2 } from "lucide-react";

function LoginFormWithSuspense() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    }>
      <FastLoginForm />
    </Suspense>
  );
}

export default function LoginPage() {
  return (
    <AuthLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-3 sm:p-4">
        <div className="w-full max-w-sm sm:max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                NayiBareilly
              </h1>
            </Link>
            <p className="text-gray-600 mt-2">Smart Civic Platform</p>
          </div>

          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
                <LogIn className="h-5 w-5 text-blue-600" />
                Welcome Back
              </CardTitle>
              <CardDescription className="text-gray-600">
                Sign in to your account
              </CardDescription>
            </CardHeader>

            <CardContent>
              <LoginFormWithSuspense />
            </CardContent>
          </Card>
          
          {/* Footer Note */}
          <p className="text-center text-xs text-gray-500 mt-6">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}