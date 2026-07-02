"use client";
import AnimatedHeading from '@/components/ui/AnimatedHeading'

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Eye, EyeOff, User, Mail, Lock, 
  Phone, MapPin, CheckCircle, AlertCircle,
  Shield, UserPlus
} from "lucide-react";
import { toast } from "react-hot-toast";
import { register as apiRegister } from '@/lib/api/auth';
import { formSubmitRateLimiter } from '@/lib/utils/rate-limiter';

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name is too long"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(15, "Phone number is too long"),
  address: z.string().min(10, "Please provide a complete address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
  requestedRole: z.literal("CITIZEN"),
  agreeToTerms: z.boolean().refine(val => val === true, "You must agree to the terms and conditions"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

// Only allow citizen registration - other roles are created by authorities

export default function GetStartedPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      requestedRole: "CITIZEN",
      agreeToTerms: false
    }
  });

  const agreeToTerms = watch("agreeToTerms");

  const onSubmit = async (data: SignupFormData) => {
    // Check rate limit before registration
    const rateKey = `register:${data.email.toLowerCase()}`
    if (!formSubmitRateLimiter.check(rateKey)) {
      const resetMs = formSubmitRateLimiter.getResetTime(rateKey)
      const minutes = resetMs ? Math.ceil(resetMs / 60000) : 1
      const remaining = formSubmitRateLimiter.getRemainingAttempts(rateKey)
      toast.error(
        `Too many registration attempts. ${remaining > 0 ? `${remaining} attempt${remaining > 1 ? 's' : ''} remaining` : `Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}`}`,
        { duration: 5000 }
      )
      return
    }

    setIsLoading(true);
    try {
      await apiRegister({ 
        email: data.email, 
        password: data.password, 
        name: data.name,
        phone: data.phone,
        address: data.address,
        requestedRole: data.requestedRole 
      });
      
      // Clear rate limit on successful registration
      formSubmitRateLimiter.clear(rateKey)
      
      toast.success('Account created successfully! Please sign in.');
      router.push('/login');
    } catch (error: unknown) {
      // Record failed attempt
      formSubmitRateLimiter.recordAttempt(rateKey)
      
      const getErrorMessage = (err: unknown): string => {
        if (typeof err === 'string') return err;
        if (err && typeof err === 'object' && 'message' in err) {
          const message = (err as { message?: unknown }).message;
          if (typeof message === 'string') return message;
        }
        return 'Account creation failed. Please try again.';
      };
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-slate-800 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <AnimatedHeading as="h1" className="text-2xl font-bold">
              <span className="text-slate-900">Nayi</span><span className="text-emerald-500">Bareilly</span>
            </AnimatedHeading>
          </Link>
          <p className="text-slate-600 mt-2">नई सोच, नया समाधान, नई बरेली</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-2">
              <UserPlus className="h-6 w-6 text-slate-800" />
              Let&apos;s Get Started
            </CardTitle>
            <CardDescription className="text-slate-600">
              Create your account to start reporting and tracking civic issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Personal Information</h3>
                
                {/* Name Field */}
                <div className="space-y-2 animate-fadeInUp">
                  <Label htmlFor="name" className="text-sm font-medium text-slate-700 flex items-center">
                    <User className="h-4 w-4 mr-2 text-slate-800" />
                    Full Name
                  </Label>
                  <div className="relative group">
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      {...register("name")}
                      className={`pl-10 transition-all duration-300 focus:scale-105 hover:shadow-md ${
                        errors.name ? 'border-red-500 focus:border-red-500' : 'focus:border-slate-700'
                      }`}
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-slate-800 transition-colors duration-300" />
                  </div>
                  {errors.name && (
                    <p className="text-sm text-red-600 flex items-center animate-fadeInLeft">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email and Phone Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Email Field */}
                  <div className="space-y-2 animate-fadeInUp animation-delay-200">
                    <Label htmlFor="email" className="text-sm font-medium text-slate-700 flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-slate-800" />
                      Email Address
                    </Label>
                    <div className="relative group">
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        {...register("email")}
                        className={`pl-10 transition-all duration-300 focus:scale-105 hover:shadow-md ${
                          errors.email ? 'border-red-500 focus:border-red-500' : 'focus:border-slate-700'
                        }`}
                      />
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-slate-800 transition-colors duration-300" />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-600 flex items-center animate-fadeInLeft">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Phone Field */}
                  <div className="space-y-2 animate-fadeInUp animation-delay-400">
                    <Label htmlFor="phone" className="text-sm font-medium text-slate-700 flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-slate-800" />
                      Phone Number
                    </Label>
                    <div className="relative group">
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        {...register("phone")}
                        className={`pl-10 transition-all duration-300 focus:scale-105 hover:shadow-md ${
                          errors.phone ? 'border-red-500 focus:border-red-500' : 'focus:border-slate-700'
                        }`}
                      />
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-slate-800 transition-colors duration-300" />
                    </div>
                    {errors.phone && (
                      <p className="text-sm text-red-600 flex items-center animate-fadeInLeft">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Address Field */}
                <div className="space-y-2 animate-fadeInUp animation-delay-600">
                  <Label htmlFor="address" className="text-sm font-medium text-slate-700 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-slate-800" />
                    Address
                  </Label>
                  <div className="relative group">
                    <Input
                      id="address"
                      type="text"
                      placeholder="Enter your complete address"
                      {...register("address")}
                      className={`pl-10 transition-all duration-300 focus:scale-105 hover:shadow-md ${
                        errors.address ? 'border-red-500 focus:border-red-500' : 'focus:border-slate-700'
                      }`}
                    />
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-slate-800 transition-colors duration-300" />
                  </div>
                  {errors.address && (
                    <p className="text-sm text-red-600 flex items-center animate-fadeInLeft">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.address.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Account Security Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Account Security</h3>
                
                {/* Password and Confirm Password Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Password Field */}
                  <div className="space-y-2 animate-fadeInUp animation-delay-800">
                    <Label htmlFor="password" className="text-sm font-medium text-slate-700 flex items-center">
                      <Lock className="h-4 w-4 mr-2 text-slate-800" />
                      Password
                    </Label>
                    <div className="relative group">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        {...register("password")}
                        className={`pl-10 pr-10 transition-all duration-300 focus:scale-105 hover:shadow-md ${
                          errors.password ? 'border-red-500 focus:border-red-500' : 'focus:border-slate-700'
                        }`}
                      />
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-slate-800 transition-colors duration-300" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-800 transition-colors duration-300"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-600 flex items-center animate-fadeInLeft">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2 animate-fadeInUp animation-delay-1000">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700 flex items-center">
                      <Lock className="h-4 w-4 mr-2 text-slate-800" />
                      Confirm Password
                    </Label>
                    <div className="relative group">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        {...register("confirmPassword")}
                        className={`pl-10 pr-10 transition-all duration-300 focus:scale-105 hover:shadow-md ${
                          errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'focus:border-slate-700'
                        }`}
                      />
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-slate-800 transition-colors duration-300" />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-800 transition-colors duration-300"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-600 flex items-center animate-fadeInLeft">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Type Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Account Type</h3>
                
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-emerald-600" />
                    <div>
                      <div className="font-medium text-blue-900">Citizen Account</div>
                      <div className="text-sm text-emerald-700">Report and track civic issues in your community</div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-emerald-600 bg-emerald-100 rounded px-2 py-1 inline-block">
                    <strong>Note:</strong> Staff, Moderator, and Admin accounts are created by authorized personnel only.
                  </div>
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start space-x-3 animate-fadeInUp animation-delay-1200">
                <div className="mt-1">
                  <Checkbox
                    id="agreeToTerms"
                    checked={agreeToTerms}
                    onCheckedChange={(checked) => setValue("agreeToTerms", checked as boolean)}
                    className="data-[state=checked]:bg-slate-800 data-[state=checked]:border-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="agreeToTerms" className="text-sm text-slate-700 cursor-pointer">
                    I agree to the{" "}
                    <a href="/terms" className="text-slate-800 hover:text-purple-700 underline font-medium">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="/privacy" className="text-slate-800 hover:text-purple-700 underline font-medium">
                      Privacy Policy
                    </a>
                  </Label>
                  {errors.agreeToTerms && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.agreeToTerms.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-slate-800 to-emerald-600 hover:from-purple-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-fadeInUp animation-delay-1400"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Create My Account</span>
                  </div>
                )}
              </Button>

              {/* Sign In Link */}
              <div className="text-center text-sm text-slate-600 animate-fadeInUp animation-delay-1600">
                <p>
                  Already have an account?{" "}
                  <Link href="/login" className="text-slate-800 hover:text-purple-700 underline font-medium">
                    Sign in here
                  </Link>
                </p>
              </div>

              {/* Security Note */}
              <div className="text-center text-sm text-slate-500 animate-fadeInUp animation-delay-1800">
                <p className="flex items-center justify-center space-x-1">
                  <Lock className="h-3 w-3" />
                  <span>Your information is secure and will never be shared</span>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}