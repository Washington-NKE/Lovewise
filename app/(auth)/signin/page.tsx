"use client"

import { useEffect } from "react"
import AuthForm from "@/components/AuthForm"
import { signInSchema } from "@/lib/validations"
import { signInWithCredentials } from "@/lib/actions/auth"

const Page = () => {
  useEffect(() => {
    // Clear cookies to break infinite redirect loops from expired/invalid tokens
    const cookies = [
      "authjs.session-token",
      "__Secure-authjs.session-token",
      "next-auth.session-token",
      "__Secure-next-auth.session-token"
    ];
    cookies.forEach(name => {
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure;`;
    });
  }, []);

  return (
    <AuthForm 
      type="SIGN_IN"
      schema={signInSchema}
      defaultValues={{
        email: "",
        password: "",
      }}
      onSubmit={signInWithCredentials} 
        />
  )
}

export default Page;