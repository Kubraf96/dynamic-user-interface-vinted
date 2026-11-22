import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Log in",
};

// A Server Action: "use server" makes it run on the server,
// even though the form in the browser calls it
async function logIn(formData) {
  "use server";

  const email = formData.get("email");
  const password = formData.get("password");
  const requestedReturnTo = formData.get("returnTo");
  const returnTo = typeof requestedReturnTo === "string" && requestedReturnTo.startsWith("/") && !requestedReturnTo.startsWith("//")
    ? requestedReturnTo
    : "/";

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  // Show Supabase's login error on the form so it is visible in the browser.
  if (error) {
    console.error("Supabase login failed:", error.message);
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect(returnTo);
}

export default async function LogInPage({ searchParams }) {
  // The login action puts Supabase's error message in the URL.
  const { error, confirmation, returnTo } = await searchParams;

  return (
    <main>
      <h1>Log in</h1>
      {error && (
        <p className="form-error" role="alert">
          Login fejlede: {error}
        </p>
      )}
      {confirmation && (
        <p role="status">
          Check your email and confirm your account before logging in.
        </p>
      )}
      <form action={logIn} className="auth-form">
        {returnTo && <input type="hidden" name="returnTo" value={returnTo} />}
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="At least 6 characters"
          autoComplete="new-password"
          minLength={6}
          required
        />

        <button type="submit">Log in</button>
      </form>
      <p>
        Do not have an account? <Link href="/signup">Sign up</Link>
      </p>
    </main>
  );
}
