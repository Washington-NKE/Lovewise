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
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl rounded-3xl overflow-hidden border-0">
        <div className="absolute top-6">
          <Heart 
            className="text-rose-500 animate-pulse" 
            size={32} 
            strokeWidth={1.5} 
          />
        </div>
        <CardHeader className="bg-gradient-to-r from-rose-600 to-pink-600 text-white p-6 text-center">
          <h1 className="text-3xl font-serif font-light tracking-wide">
            {isSignIn ? "Welcome Back" : "Create Your Love Story"}
          </h1>
          <p className="text-white/80 mt-2 font-light text-sm">
            {isSignIn
              ? "Reconnect with your special someone"
              : "Begin your journey of love and connection"}
          </p>
        </CardHeader>
        <CardContent className="p-8 space-y-6 bg-white">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              {Object.keys(defaultValues).map((field) => (
                <FormField
                  key={field}
                  control={form.control}
                  name={field as Path<T>}
                  render={({ field: inputField }) => (
                    <FormItem>
                      <FormLabel className="text-rose-800 font-light capitalize">
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
                          placeholder-rose-300 text-rose-900"
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
                    className="text-sm font-medium text-rose-600 hover:text-rose-800 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full mt-6 bg-gradient-to-r from-rose-600 to-pink-600 
                hover:from-rose-700 hover:to-pink-700 text-white rounded-xl 
                py-3 transition-all duration-300 ease-in-out transform 
                hover:scale-[1.02] hover:shadow-lg"
              >
                {isSignIn ? "Sign In" : "Sign Up"}
              </Button>
            </form>
          </Form>

          <div className="text-center mt-6 text-sm text-rose-900">
            {isSignIn ? "New to Lovewise? " : "Already have an account? "}
            <Link
              href={isSignIn ? "/signup" : "/signin"}
              className="font-semibold text-rose-600 hover:text-rose-800 ml-1 transition-colors"
            >
              {isSignIn ? "Create an account" : "Sign in"}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthForm;