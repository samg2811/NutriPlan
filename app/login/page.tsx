"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleAuth() {
    setLoading(true);
    setMessage("");

    if (!email || !password) {
      setMessage("Please enter your email and password.");
      setLoading(false);
      return;
    }

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      setMessage(
        "Account created! Check your email to confirm your account."
      );
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          🍽️ NutriPlan
        </div>

        <h1>
          {isSignUp ? "Create your account" : "Welcome back"}
        </h1>

        <p className="auth-description">
          {isSignUp
            ? "Create an account to save your meals and plans."
            : "Log in to continue using NutriPlan."}
        </p>

        <label>Email</label>

        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Password</label>

        <input
          type="password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {message && (
          <p className="auth-message">
            {message}
          </p>
        )}

        <button
          className="primary-button auth-button"
          onClick={handleAuth}
          disabled={loading}
        >
          {loading
            ? "Please wait..."
            : isSignUp
            ? "Create Account"
            : "Log In"}
        </button>

        <button
          className="auth-switch"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setMessage("");
          }}
        >
          {isSignUp
            ? "Already have an account? Log in"
            : "Don't have an account? Sign up"}
        </button>

        <button
          className="back-home"
          onClick={() => router.push("/")}
        >
          ← Back to NutriPlan
        </button>
      </div>
    </main>
  );
}
