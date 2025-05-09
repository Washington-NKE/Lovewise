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
import { useEffect, useState } from "react";

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
import Link from "next/link";
import { FIELD_NAMES, FIELD_TYPES } from "@/constants";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
  const [mounted, setMounted] = useState(false);
  const isSignIn = type === "SIGN_IN";

  const form: UseFormReturn<T> = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<T>,
  });

  useEffect(() => {
    setMounted(true);
    
    // Create particles
    if (typeof window !== 'undefined') {
      const particlesContainer = document.getElementById('particles');
      if (particlesContainer) {
        particlesContainer.innerHTML = '';
        for (let i = 0; i < 50; i++) {
          const particle = document.createElement('div');
          particle.classList.add('particle');
          particle.style.left = `${Math.random() * 100}%`;
          particle.style.top = `${Math.random() * 100}%`;
          particle.style.animationDuration = `${3 + Math.random() * 10}s`;
          particle.style.animationDelay = `${Math.random() * 5}s`;
          particlesContainer.appendChild(particle);
        }
      }
      
      // Create floating hearts
      const heartsContainer = document.getElementById('hearts');
      if (heartsContainer) {
        heartsContainer.innerHTML = '';
        for (let i = 0; i < 15; i++) {
          const heart = document.createElement('div');
          heart.classList.add('heart');
          heart.style.left = `${Math.random() * 100}%`;
          heart.style.top = `${Math.random() * 100}%`;
          heart.style.transform = `scale(${0.5 + Math.random()})`;
          heart.style.opacity = `${0.05 + Math.random() * 0.1}`;
          heartsContainer.appendChild(heart);
          
          // Animate hearts
          animateHeart(heart);
        }
      }
    }
  }, []);

  const animateHeart = (heart: HTMLElement) => {
    if (typeof window !== 'undefined' && 'animate' in heart) {
      const duration = 15 + Math.random() * 15;
      heart.animate(
        [
          { transform: `translate(0, 0) scale(${0.5 + Math.random()}) rotate(0deg)` },
          { transform: `translate(${-50 + Math.random() * 100}px, ${-150 - Math.random() * 100}px) scale(${0.5 + Math.random()}) rotate(${Math.random() * 360}deg)` }
        ],
        {
          duration: duration * 1000,
          iterations: Infinity,
          delay: Math.random() * 5000,
          easing: 'ease-in-out'
        }
      );
    }
  };

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

  // Only render the UI after component is mounted to avoid hydration issues
  if (!mounted) return null;

  return (
    <>
      <div className="background-particles" id="particles"></div>
      <div id="hearts"></div>
      
      <div className="container">
        <div className="form-box">
          <h2>{isSignIn ? "Welcome Back" : "Create Account"}</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              {Object.keys(defaultValues).map((field) => (
                <div className="input-group" key={field}>
                  <FormField
                    control={form.control}
                    name={field as Path<T>}
                    render={({ field: inputField }) => (
                      <FormItem>
                        <FormControl>
                          <input
                            required
                            type={FIELD_TYPES[inputField.name as keyof typeof FIELD_TYPES]}
                            {...inputField}
                          />
                        </FormControl>
                        <label>{FIELD_NAMES[inputField.name as keyof typeof FIELD_NAMES]}</label>
                        <FormMessage className="text-error" />
                      </FormItem>
                    )}
                  />
                </div>
              ))}

              {isSignIn && (
                <div className="forgot-pass">
                  <Link href="/forgot-password">Forgot Password?</Link>
                </div>
              )}

              <button type="submit" className="btn">
                {isSignIn ? "Sign In" : "Sign Up"}
              </button>
              
              <div className="signup-link">
                <p>
                  {isSignIn ? "Don't have an account? " : "Already have an account? "}
                  <Link href={isSignIn ? "/signup" : "/signin"}>
                    {isSignIn ? "Sign Up" : "Sign In"}
                  </Link>
                </p>
              </div>
            </form>
          </Form>
        </div>
      </div>

      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
          background-color: #0a0a0f;
          background-image: linear-gradient(135deg, #0f0f1a 0%, #1a0a14 100%);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          position: relative;
          margin: 0;
          padding: 0;
        }
        
        .background-particles {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 1;
        }
        
        .particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: #ff3c8e;
          border-radius: 50%;
          opacity: 0.3;
          animation: float 8s infinite ease-in-out;
        }
        
        @keyframes float {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: translateY(-100px) translateX(20px); opacity: 0; }
        }
        
        .container {
          position: relative;
          z-index: 2;
          width: 400px;
          padding: 40px;
          background-color: rgba(18, 18, 30, 0.85);
          backdrop-filter: blur(15px);
          border-radius: 20px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.08);
          overflow: hidden;
        }
        
        .container::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 380px;
          height: 420px;
          background: linear-gradient(0deg, transparent, #ff3c8e, #ff3c8e);
          transform-origin: bottom right;
          animation: animate 6s linear infinite;
          z-index: -1;
        }
        
        .container::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 380px;
          height: 420px;
          background: linear-gradient(0deg, transparent, #ff3c8e, #ff3c8e);
          transform-origin: bottom right;
          animation: animate 6s linear infinite;
          animation-delay: -3s;
          z-index: -1;
        }
        
        @keyframes animate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        
        .form-box {
          position: relative;
          z-index: 1;
          background: rgba(18, 18, 30, 0.9);
          border-radius: 10px;
          padding: 30px;
        }
        
        h2 {
          color: #fff;
          text-align: center;
          font-size: 28px;
          margin-bottom: 30px;
          font-weight: 300;
          letter-spacing: 1px;
        }
        
        .input-group {
          position: relative;
          margin-bottom: 25px;
        }
        
        .input-group input {
          width: 100%;
          padding: 15px 10px;
          background: rgba(255, 255, 255, 0.05);
          border: none;
          outline: none;
          border-radius: 8px;
          color: #fff;
          font-size: 16px;
          letter-spacing: 1px;
          transition: 0.5s;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .input-group input:focus {
          background: rgba(255, 60, 142, 0.05);
          border: 1px solid rgba(255, 60, 142, 0.3);
          box-shadow: 0 0 10px rgba(255, 60, 142, 0.1);
        }
        
        .input-group label {
          position: absolute;
          top: 15px;
          left: 15px;
          color: rgba(255, 255, 255, 0.7);
          pointer-events: none;
          transition: 0.5s;
        }
        
        .input-group input:focus ~ label,
        .input-group input:valid ~ label {
          top: -12px;
          left: 10px;
          color: #ff3c8e;
          font-size: 12px;
          background: rgba(18, 18, 30, 0.9);
          padding: 0 5px;
        }
        
        .forgot-pass {
          margin-bottom: 20px;
          text-align: right;
        }
        
        .forgot-pass a {
          color: rgba(255, 255, 255, 0.6);
          text-decoration: none;
          font-size: 14px;
          transition: 0.3s;
        }
        
        .forgot-pass a:hover {
          color: #ff3c8e;
        }
        
        .btn {
          position: relative;
          width: 100%;
          height: 50px;
          background: linear-gradient(45deg, #ff3c8e, #ff8fb8);
          border: none;
          outline: none;
          border-radius: 8px;
          color: #fff;
          font-size: 16px;
          font-weight: 500;
          letter-spacing: 1px;
          cursor: pointer;
          z-index: 1;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(255, 60, 142, 0.3);
          transition: 0.5s;
        }
        
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 60, 142, 0.4);
        }
        
        .btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 0%;
          height: 100%;
          background: linear-gradient(45deg, #a50052, #ff3c8e);
          z-index: -1;
          transition: 0.5s;
        }
        
        .btn:hover::before {
          width: 100%;
        }
        
        .signup-link {
          margin-top: 30px;
          text-align: center;
        }
        
        .signup-link p {
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
        }
        
        .signup-link a {
          color: #ff3c8e;
          text-decoration: none;
          font-weight: 500;
          transition: 0.3s;
        }
        
        .signup-link a:hover {
          text-decoration: underline;
        }

        /* Add the heart styling */
        .heart {
          position: absolute;
          width: 20px;
          height: 20px;
          background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ff3c8e'%3E%3Cpath d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'/%3E%3C/svg%3E") no-repeat center center;
          opacity: 0.1;
          z-index: 1;
        }
        
        .text-error {
          color: #ff3c8e;
          font-size: 12px;
          margin-top: 5px;
          margin-left: 10px;
        }
      `}</style>
    </>
  );
};

export default AuthForm;