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
import { Heart, KeyRound, Mail, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

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
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full"
    >
      <Card className="w-full max-w-md border border-rose-500/10 bg-black/40 backdrop-blur-2xl rounded-2xl shadow-2xl relative overflow-hidden text-[#f7ebe1] select-none mx-auto">
        {/* Glow backlight overlay inside card */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <CardHeader className="pt-8 pb-4 text-center relative z-10">
          <div className="mx-auto w-10 h-10 rounded-full bg-[#290d1c] border border-rose-500/25 flex items-center justify-center mb-4">
            <Heart 
              className="text-[#ff7a9a] fill-[#ff7a9a]/20 animate-pulse" 
              size={18} 
              strokeWidth={1.5} 
            />
          </div>
          
          <h1 className="text-2xl md:text-3xl font-serif italic text-[#f7ebe1] tracking-wide">
            {isSignIn ? "Welcome Back" : "Begin Your Journey"}
          </h1>
          <p className="text-xs text-rose-300/50 uppercase tracking-widest mt-1.5 font-serif">
            {isSignIn
              ? "Reconnect with your partner"
              : "Begin your story of connection"}
          </p>
        </CardHeader>
        
        <CardContent className="px-6 sm:px-8 pb-8 space-y-6 relative z-10">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              {Object.keys(defaultValues).map((field) => (
                <FormField
                  key={field}
                  control={form.control}
                  name={field as Path<T>}
                  render={({ field: inputField }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[#f7ebe1]/80 font-serif italic text-xs tracking-wider">
                        {FIELD_NAMES[inputField.name as keyof typeof FIELD_NAMES]}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            required
                            type={
                              FIELD_TYPES[inputField.name as keyof typeof FIELD_TYPES]
                            }
                            {...inputField}
                            className="w-full bg-[#1b0813]/60 border border-rose-950/40 focus:border-[#ff7a9a] focus:ring-1 focus:ring-[#ff7a9a] text-rose-50 placeholder-rose-950/50 rounded-xl py-3.5 pl-4 pr-10 text-sm outline-none transition-all"
                            placeholder={`Enter your ${FIELD_NAMES[inputField.name as keyof typeof FIELD_NAMES]?.toLowerCase()}`}
                          />
                          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-rose-300/25 pointer-events-none">
                            {inputField.name === "email" ? (
                              <Mail size={16} />
                            ) : inputField.name === "password" ? (
                              <KeyRound size={16} />
                            ) : (
                              <Sparkles size={16} />
                            )}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px] text-rose-400 mt-0.5" />
                    </FormItem>
                  )}
                />
              ))}

              {isSignIn && (
                <div className="flex justify-end pt-1">
                  <Link
                    href="/forgot-password"
                    className="text-xs font-serif italic text-[#ff7a9a]/70 hover:text-[#ff7a9a] transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full mt-4 bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-700 hover:to-red-600 text-white rounded-xl py-6 font-medium text-sm tracking-wide border-0 cursor-pointer shadow-lg shadow-rose-950/30 transition-all transform active:scale-[0.98]"
              >
                {isSignIn ? "Sign In" : "Sign Up"}
              </Button>
            </form>
          </Form>

          {!isSignIn && (
            <div className="text-center text-xs text-rose-300/40">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="font-semibold text-[#ff7a9a] hover:text-rose-400 ml-1 transition-colors"
              >
                Sign in
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AuthForm;