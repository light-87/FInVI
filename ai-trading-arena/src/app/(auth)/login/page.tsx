import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Login | AI Trading Arena",
  description: "Sign in to your AI Trading Arena account",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-display text-text-primary mb-2">
            AI Trading <span className="text-primary">Arena</span>
          </h1>
          <p className="text-text-secondary">
            Sign in to manage your AI agents
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-surface border border-border rounded-lg p-8">
          <h2 className="text-xl font-semibold text-text-primary mb-6">
            Welcome back
          </h2>

          <LoginForm />

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-surface text-text-tertiary">
                New to AI Trading Arena?
              </span>
            </div>
          </div>

          {/* Signup Link */}
          <Link
            href="/signup"
            className="block w-full text-center py-3 border border-border rounded-lg text-text-primary hover:border-primary transition-colors"
          >
            Create an account
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-text-tertiary text-sm mt-8">
          By signing in, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
