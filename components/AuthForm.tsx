"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  DefaultValues,
  FieldValues,
  Path,
  SubmitHandler,
  useForm,
  UseFormReturn,
} from "react-hook-form";
import { ZodType } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { FIELD_NAMES, FIELD_TYPES } from "@/constants";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";

interface Props<T extends FieldValues> {
  schema: ZodType<T>;
  defaultValues: T;
  onSubmit: (data: T) => Promise<{ success: boolean; error?: string }>;
  type: "SIGN_IN" | "SIGN_UP";
}

const AuthForm = <T extends FieldValues>({
  type,
  schema,
  defaultValues,
  onSubmit,
}: Props<T>) => {
  const router = useRouter();

  const isSignIn = type === "SIGN_IN";

  const form: UseFormReturn<T> = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<T>,
  });

  const handleSubmit: SubmitHandler<T> = async (data) => {
    const result = await onSubmit(data);

    if (result.success) {
      toast.success("Success", {
        description: isSignIn
          ? "You have successfully signed in."
          : "You have successfully signed up."
      });

      router.push("/dashboard");
    } else {
      toast.error(`Error ${isSignIn ? "signing in" : "signing up"}`, {
        description: result.error ?? "An error occurred."
      });
    }
  };

  return (
    <>
      <style jsx>{`
        @keyframes borderGlow {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        @keyframes heartbeat {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
        
        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .border-animation {
          position: relative;
          background: linear-gradient(45deg, #f43f5e, #ec4899, #8b5cf6, #06b6d4, #f43f5e);
          background-size: 400% 400%;
          animation: borderGlow 3s ease infinite;
          padding: 2px;
          border-radius: 24px;
        }
        
        .card-inner {
          background: white;
          border-radius: 22px;
          overflow: hidden;
        }
        
        .heart-icon {
          animation: heartbeat 2s ease-in-out infinite;
        }
        
        .shimmer-text {
          background: linear-gradient(90deg, #f43f5e, #ec4899, #f43f5e);
          background-size: 200% 100%;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 2s ease-in-out infinite;
        }
        
        .floating-element {
          animation: float 6s ease-in-out infinite;
        }
        
        .input-glow:focus {
          box-shadow: 0 0 20px rgba(244, 63, 94, 0.3);
        }
        
        .button-premium {
          background: linear-gradient(135deg, #f43f5e, #ec4899, #be185d);
          background-size: 200% 200%;
          transition: all 0.4s ease;
        }
        
        .button-premium:hover {
          background-position: right center;
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(244, 63, 94, 0.4);
        }
      `}</style>
      
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Floating background elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-rose-200 rounded-full opacity-20 floating-element"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-pink-200 rounded-full opacity-20 floating-element" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-10 w-16 h-16 bg-purple-200 rounded-full opacity-20 floating-element" style={{animationDelay: '4s'}}></div>
        
        <div className="border-animation shadow-2xl">
          <Card className="card-inner w-full max-w-md border-0">
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10">
              <Heart 
                className="text-rose-500 heart-icon" 
                size={32} 
                strokeWidth={1.5} 
                fill="currentColor"
              />
            </div>
            
            <CardHeader className="bg-gradient-to-br from-rose-600 via-pink-600 to-purple-600 text-white p-8 text-center relative overflow-hidden">
              {/* Shimmer overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full animate-pulse" style={{animation: 'shimmer 3s infinite'}}></div>
              
              <h1 className="text-3xl font-serif font-light tracking-wide mt-4 shimmer-text relative z-10">
                {isSignIn ? "Welcome Back" : "Create Your Love Story"}
              </h1>
              <p className="text-white/90 mt-3 font-light text-sm leading-relaxed relative z-10">
                {isSignIn
                  ? "Reconnect with your special someone"
                  : "Begin your journey of love and connection"}
              </p>
            </CardHeader>
            
            <CardContent className="p-8 space-y-6 bg-gradient-to-b from-white via-rose-50/30 to-white">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-6"
                >
                  {Object.keys(defaultValues).map((field, index) => (
                    <FormField
                      key={field}
                      control={form.control}
                      name={field as Path<T>}
                      render={({ field: inputField }) => (
                        <FormItem className="transform transition-all duration-300 hover:scale-[1.02]">
                          <FormLabel className="text-rose-800 font-medium capitalize text-sm tracking-wide">
                            {FIELD_NAMES[inputField.name as keyof typeof FIELD_NAMES]}
                          </FormLabel>
                          <FormControl>
                            <Input
                              required
                              type={
                                FIELD_TYPES[inputField.name as keyof typeof FIELD_TYPES]
                              }
                              {...inputField}
                              className="w-full border-rose-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 
                              transition-all duration-300 ease-in-out rounded-xl py-3 px-4 
                              placeholder-rose-300 text-rose-900 input-glow backdrop-blur-sm
                              hover:border-rose-300 hover:shadow-md"
                              style={{
                                animationDelay: `${index * 100}ms`,
                                animation: 'fadeInUp 0.6s ease forwards'
                              }}
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-rose-500 mt-1" />
                        </FormItem>
                      )}
                    />
                  ))}

                  {isSignIn && (
                    <div className="flex justify-end">
                      <Link
                        href="/forgot-password"
                        className="text-sm font-medium text-rose-600 hover:text-rose-800 transition-all duration-300 
                        hover:underline underline-offset-2 decoration-2 decoration-rose-400"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full mt-8 button-premium text-white rounded-xl 
                    py-4 font-medium text-base tracking-wide border-0 
                    transition-all duration-400 ease-out transform 
                    hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span className="relative z-10">
                      {isSignIn ? "Sign In" : "Sign Up"}
                    </span>
                  </Button>
                </form>
              </Form>

              <div className="text-center mt-8 text-sm text-rose-900">
                {isSignIn ? "New to Lovewise? " : "Already have an account? "}
                <Link
                  href={isSignIn ? "/signup" : "/signin"}
                  className="font-semibold text-rose-600 hover:text-rose-800 ml-1 transition-all duration-300
                  hover:underline underline-offset-2 decoration-2 decoration-rose-400"
                >
                  {isSignIn ? "Create an account" : "Sign in"}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AuthForm;