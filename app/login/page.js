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

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  // Something went wrong: back to the form with ?error=true in the URL
  if (error) {
    console.error("Supabase login failed:", error.message);
    redirect("/login?error=true");
  }

  redirect("/");
}

export default async function LogInPage({ searchParams }) {
  // ?error=true is set by logIn when Supabase says no
  const { error, confirmation } = await searchParams;

  return (
    <main>
      <h1>Log in</h1>
      {error && (
        <p className="form-error" role="alert">
          Could not log in. Please check your email and password.
        </p>
      )}
      {confirmation && (
        <p role="status">
          Check your email and confirm your account before logging in.
        </p>
      )}
      <form action={logIn} className="auth-form">
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
