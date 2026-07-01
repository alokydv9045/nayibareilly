"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Eye, EyeOff, User, Mail, Lock, 
  Phone, MapPin, CheckCircle, AlertCircle 
} from "lucide-react";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name is too long"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(15, "Phone number is too long"),
  address: z.string().min(10, "Please provide a complete address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
  agreeToTerms: z.boolean().refine(val => val === true, "You must agree to the terms and conditions"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function CitizenSignupForm() {
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
  });

  const agreeToTerms = watch("agreeToTerms");

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log("Signup data:", data);
      // Handle signup logic here
    } catch (error) {
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
        className="w-full py-3 bg-gradient-to-r from-slate-800 to-teal-600 hover:from-purple-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-fadeInUp animation-delay-1400"
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Creating Account...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>Create Account</span>
          </div>
        )}
      </Button>

      {/* Additional Info */}
      <div className="text-center text-sm text-slate-500 animate-fadeInUp animation-delay-1600">
        <p className="flex items-center justify-center space-x-1">
          <Lock className="h-3 w-3" />
          <span>Your information is secure and will never be shared</span>
        </p>
      </div>
    </form>
  );
}