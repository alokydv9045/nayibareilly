"use client";
import AnimatedHeading from '@/components/ui/AnimatedHeading'

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
        <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        <span className="ml-2 text-slate-600">Loading...</span>
      </div>
    }>
      <FastLoginForm />
    </Suspense>
  );
}

export default function LoginPage() {
  return (
    <AuthLayout>
      <div className="min-h-screen bg-transparent flex items-center justify-center p-3 sm:p-4 selection:bg-emerald-500 selection:text-white">
        <div className="w-full max-w-sm sm:max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-md group-hover:bg-emerald-600 transition-colors">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <AnimatedHeading as="h1" className="text-2xl font-bold">
                <span className="text-slate-900">Nayi</span><span className="text-emerald-500">Bareilly</span>
              </AnimatedHeading>
            </Link>
            <p className="text-slate-500 mt-2 font-medium">Smart Civic Platform</p>
          </div>

          <Card className="shadow-sm border border-slate-200 bg-white">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-xl font-bold text-slate-900 flex items-center justify-center gap-2">
                <LogIn className="h-5 w-5 text-emerald-500" />
                Welcome Back
              </CardTitle>
              <CardDescription className="text-slate-500 font-medium">
                Sign in to your account
              </CardDescription>
            </CardHeader>

            <CardContent>
              <LoginFormWithSuspense />
            </CardContent>
          </Card>
          
          {/* Footer Note */}
          <p className="text-center text-xs text-slate-500 mt-6 font-medium">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="text-emerald-600 hover:text-emerald-700 hover:underline">Terms of Service</Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-emerald-600 hover:text-emerald-700 hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}