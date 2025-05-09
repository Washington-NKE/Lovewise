
"use client";

import AuthForm from "@/components/AuthForm"
import { signInSchema } from "@/lib/validations"
import { signInWithCredentials } from "@/lib/actions/auth"

const SignInPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <AuthForm
        type="SIGN_IN"
        schema={signInSchema}
        defaultValues={{
          email: "",
          password: "",
        }}
        onSubmit={signInWithCredentials}
      />
    </div>
  );
};

export default SignInPage;