"use client";

import { useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import HeroWithPhone from "@/components/HeroWithPhone";
import StatsSection from "@/components/StatsSection";
import StatsPhone from "@/components/StatsPhone";
import { scrollToLogin } from "@/lib/scrollToLogin";
import styles from "./login.module.css";
import NextImage from "next/image";

type Mode = "login" | "signup";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_PASSWORD = 8;
const MAX_FAILURES = 5;
const COOLDOWN_MS = 30_000;

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Client-side cooldown is a convenience only. Supabase rate limits are the real protection.
  const failures = useRef(0);
  const lockedUntil = useRef(0);

  const isSignUp = mode === "signup";

  function validate(): boolean {
    const cleanEmail = email.trim();
    let ok = true;

    if (!cleanEmail) {
      setEmailError("Enter your email address.");
      ok = false;
    } else if (!EMAIL_RE.test(cleanEmail)) {
      setEmailError("Enter a valid email, like name@example.com.");
      ok = false;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Enter your password.");
      ok = false;
    } else if (isSignUp && password.length < MIN_PASSWORD) {
      setPasswordError(`Use at least ${MIN_PASSWORD} characters.`);
      ok = false;
    } else {
      setPasswordError("");
    }

    return ok;
  }

  function switchMode() {
    setMode(isSignUp ? "login" : "signup");
    setError("");
    setInfo("");
    setEmailError("");
    setPasswordError("");
    setPassword("");
    setShowPassword(false);
  }

  function trackCaps(e: KeyboardEvent<HTMLInputElement>) {
    setCapsLock(e.getModifierState("CapsLock"));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    setError("");
    setInfo("");

    const wait = lockedUntil.current - Date.now();
    if (wait > 0) {
      setError(`Too many attempts. Try again in ${Math.ceil(wait / 1000)} seconds.`);
      return;
    }

    if (!validate()) return;

    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
        });

        if (signUpError) {
          // Only echo password problems. Anything else stays generic so the form
          // never confirms whether an email already has an account.
          setError(
            /password/i.test(signUpError.message)
              ? signUpError.message
              : "We couldn't create your account. Check your details and try again."
          );
          setLoading(false);
          return;
        }

        if (!data.session) {
          setMode("login");
          setPassword("");
          setInfo("Check your email to confirm your account, then log in.");
          setLoading(false);
          return;
        }

        router.replace("/");
        router.refresh();
        return;
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (signInError) {
        failures.current += 1;
        if (failures.current >= MAX_FAILURES) {
          lockedUntil.current = Date.now() + COOLDOWN_MS;
          failures.current = 0;
        }

        if (signInError.status === 429) {
          setError("Too many attempts. Wait a minute, then try again.");
        } else if (/not confirmed/i.test(signInError.message)) {
          setError("Confirm your email first. Check your inbox for the link.");
        } else {
          // Same message for a wrong email or a wrong password.
          setError("Email or password is incorrect.");
        }
        setPassword("");
        setLoading(false);
        return;
      }

      if (!data.session) {
        setError("You're signed in, but the session didn't start. Try again.");
        setLoading(false);
        return;
      }

      router.replace("/");
      router.refresh();
    } catch (err) {
      console.error("Authentication error:", err);
      setError("Can't reach NutriGoal. Check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <nav className="navbar">
           <div
             className="logo"
             style={{ display: "flex", alignItems: "center", gap: 10 }}
           >
             <NextImage
               src="/nutriplan-logo.png"
               alt=""
               width={44}
               height={44}
               style={{ mixBlendMode: "multiply", borderRadius: 10 }}
             />
             NutriGoal
           </div>
        <a href="/login" className={`logo ${styles.brandLink}`}>🍽️ NutriGoal</a>
        <div className="nav-links">
          <a href="#login" onClick={(e) => { e.preventDefault(); scrollToLogin(); }}>Log in</a>
        </div>
      </nav>

      <HeroWithPhone />
      <StatsSection />
      <StatsPhone onGetStarted={scrollToLogin} />

      <section className={styles.loginSection} id="login">
        <div className={styles.card}>
          <h1>{isSignUp ? "Create your account" : "Welcome back"}</h1>
          <p className={styles.lead}>
            {isSignUp
              ? "Save your meals, your plans and your daily log."
              : "Log in to continue using NutriGoal."}
          </p>

          <div aria-live="polite">
            {error && <p className={`${styles.banner} ${styles.bannerError}`} role="alert">{error}</p>}
            {info && <p className={`${styles.banner} ${styles.bannerInfo}`}>{info}</p>}
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>Email</label>
              <input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                maxLength={254}
                placeholder="you@example.com"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={emailError ? true : undefined}
                aria-describedby={emailError ? "email-error" : undefined}
              />
              {emailError && <p id="email-error" className={styles.fieldError}>{emailError}</p>}
            </div>

            <div className={styles.field}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <div className={styles.inputWrap}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  maxLength={128}
                  placeholder={isSignUp ? `At least ${MIN_PASSWORD} characters` : "Your password"}
                  className={`${styles.input} ${styles.withToggle}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={trackCaps}
                  onKeyDown={trackCaps}
                  aria-invalid={passwordError ? true : undefined}
                  aria-describedby={passwordError ? "password-error" : undefined}
                />
                <button
                  type="button"
                  className={styles.toggle}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-pressed={showPassword}
                  aria-controls="password"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {capsLock && <p className={styles.hint}>Caps Lock is on.</p>}
              {passwordError && <p id="password-error" className={styles.fieldError}>{passwordError}</p>}
            </div>

            <button type="submit" className={styles.submit} disabled={loading}>
              {loading && <span className={styles.spinner} aria-hidden="true" />}
              {loading
                ? isSignUp ? "Creating account…" : "Logging in…"
                : isSignUp ? "Create account" : "Log in"}
            </button>
          </form>

          <p className={styles.switch}>
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button type="button" className={styles.switchBtn} onClick={switchMode}>
              {isSignUp ? "Log in" : "Sign up"}
            </button>
          </p>
        </div>
      </section>

      <footer>
        <strong>NutriGoal</strong>
        <span>Plan smarter. Eat better. Waste less.</span>
      </footer>
    </main>
  );
}
