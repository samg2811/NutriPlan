// Scrolls to the login form at the bottom of the login page and focuses the email field.
export function scrollToLogin() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document
    .getElementById("login")
    ?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  window.setTimeout(
    () => document.getElementById("email")?.focus({ preventScroll: true }),
    reduce ? 0 : 700
  );
}
