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
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  // Something went wrong: back to the form with ?error=true in the URL
  if (error) {
    redirect("/login?error=true");
  }

  const username = data.user?.user_metadata?.username;
  if (data.user && typeof username === "string" && username) {
    const { data: profile, error: profileLookupError } = await supabase
      .from("profiles")
      .select("id,username")
      .eq("id", data.user.id)
      .maybeSingle();
    if (profileLookupError) {
      console.error("Profile lookup after login failed:", profileLookupError.message);
    } else if (!profile?.username) {
      const { error: profileError } = await supabase.from("profiles").upsert(
        { id: data.user.id, username },
        { onConflict: "id" },
      );
      if (profileError) console.error("Profile save after login failed:", profileError.message);
    }
  }

  redirect("/");
}

export default async function LogInPage({ searchParams }) {
  // ?error=true is set by logIn when Supabase says no
  const { error } = await searchParams;

  return (
    <main>
      <h1>Log in</h1>
      {error && (
        <p className="form-error" role="alert">
          Could not log in. Please check your email and password.
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
