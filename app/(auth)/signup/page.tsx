"use client";

import AuthForm from "@/components/AuthForm";
import { signUpSchema } from "@/lib/validations";
import { signUp } from "@/lib/actions/auth";

const SignUpPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <AuthForm
        type="SIGN_UP"
        schema={signUpSchema}
        defaultValues={{
          email: "",
          password: "",
          fullName: "",
        }}
        onSubmit={signUp}
      />
    </div>
  );
};

export default SignUpPage;