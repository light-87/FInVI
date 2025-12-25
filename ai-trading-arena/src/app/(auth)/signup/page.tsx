import Link from "next/link";
import { SignupForm } from "./signup-form";

export const metadata = {
  title: "Sign Up | Vivy",
  description: "Create your Vivy account",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-display text-text-primary mb-2">
            <span className="text-primary">Vivy</span>
          </h1>
          <p className="text-text-secondary">
            Create AI trading agents with natural language
          </p>
        </div>

        {/* Signup Card */}
        <div className="bg-surface border border-border rounded-lg p-8">
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Create your account
          </h2>
          <p className="text-text-secondary text-sm mb-6">
            Start with 10 free analyses per day
          </p>

          <SignupForm />

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-surface text-text-tertiary">
                Already have an account?
              </span>
            </div>
          </div>

          {/* Login Link */}
          <Link
            href="/login"
            className="block w-full text-center py-3 border border-border rounded-lg text-text-primary hover:border-primary transition-colors"
          >
            Sign in instead
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-text-tertiary text-sm mt-8">
          By creating an account, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
