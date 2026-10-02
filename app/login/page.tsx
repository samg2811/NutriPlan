"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleAuth() {
    if (loading) return;

    setLoading(true);
    setMessage("");

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setMessage("Please enter your email and password.");
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
        });

        if (error) {
          setMessage(error.message);
          setLoading(false);
          return;
        }

        // If email confirmation is enabled, session will be null.
        if (!data.session) {
          setMessage(
            "Account created! Check your email to confirm your account, then log in."
          );
          setIsSignUp(false);
          setLoading(false);
          return;
        }

        router.replace("/");
        router.refresh();
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      if (!data.session) {
        setMessage("Login succeeded, but no session was created. Please try again.");
        setLoading(false);
        return;
      }

      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Authentication error:", error);

      setMessage(
        "Something went wrong while connecting to Supabase. Please try again."
      );

      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🍽️ NutriPlan</div>

        <h1>
          {isSignUp ? "Create your account" : "Welcome back"}
        </h1>

        <p className="auth-description">
          {isSignUp
            ? "Create an account to save your meals and plans."
            : "Log in to continue using NutriPlan."}
        </p>

        <label htmlFor="email">Email</label>

        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <label htmlFor="password">Password</label>

        <input
          id="password"
          type="password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={isSignUp ? "new-password" : "current-password"}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAuth();
            }
          }}
        />

        {message && (
          <p className="auth-message">
            {message}
          </p>
        )}

        <button
          type="button"
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
          type="button"
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
      </div>
    </main>
  );
}
