@@ -5,8 +5,8 @@ import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
@@ -15,18 +15,49 @@ export default function LoginPage() {
  const [message, setMessage] = useState("");

  async function handleAuth() {
    if (loading) return;

    setLoading(true);
    setMessage("");

    if (!email || !password) {
    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setMessage("Please enter your email and password.");
      setLoading(false);
      return;
    }

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
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

@@ -36,34 +67,29 @@ export default function LoginPage() {
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
      if (!data.session) {
        setMessage("Login succeeded, but no session was created. Please try again.");
        setLoading(false);
        return;
      }

      router.push("/");
      router.replace("/");
      router.refresh();
    }
    } catch (error) {
      console.error("Authentication error:", error);

      setMessage(
        "Something went wrong while connecting to Supabase. Please try again."
      );

    setLoading(false);
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          🍽️ NutriPlan
        </div>
        <div className="auth-logo">🍽️ NutriPlan</div>

        <h1>
          {isSignUp ? "Create your account" : "Welcome back"}
@@ -75,22 +101,31 @@ export default function LoginPage() {
            : "Log in to continue using NutriPlan."}
        </p>

        <label>Email</label>
        <label htmlFor="email">Email</label>

        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <label>Password</label>
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
@@ -100,6 +135,7 @@ export default function LoginPage() {
        )}

        <button
          type="button"
          className="primary-button auth-button"
          onClick={handleAuth}
          disabled={loading}
@@ -112,6 +148,7 @@ export default function LoginPage() {
        </button>

        <button
          type="button"
          className="auth-switch"
          onClick={() => {
            setIsSignUp(!isSignUp);
@@ -122,13 +159,6 @@ export default function LoginPage() {
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
