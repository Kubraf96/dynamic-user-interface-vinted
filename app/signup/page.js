import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Sign up",
};

// A Server Action: "use server" makes it run on the server,
// even though the form in the browser calls it
async function signUp(formData) {
  "use server";

  const rawUsername = formData.get("username");
  const email = formData.get("email");
  const password = formData.get("password");
  const username = typeof rawUsername === "string" ? rawUsername.trim().toLowerCase() : "";

  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    redirect("/signup?error=usernameFormat");
  }

  const supabase = await createClient();
  const { data: profiles, error: usernameError } = await supabase
    .from("profiles")
    .select("username");
  if (usernameError) {
    console.error("Username lookup failed:", usernameError.message);
    redirect("/signup?error=profile");
  }
  if ((profiles || []).some((profile) => profile.username?.toLowerCase() === username)) {
    redirect("/signup?error=usernameTaken");
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });

  // Something went wrong: back to the form with ?error=true in the URL
  if (error) {
    redirect("/signup?error=true");
  }

  // Email confirmation can leave `session` null. In that case, the username
  // stays in Auth metadata and is copied into profiles after the first login.
  if (data.session && data.user) {
    const { error: profileError } = await supabase.from("profiles").upsert(
      { id: data.user.id, username },
      { onConflict: "id" },
    );
    if (profileError) {
      console.error("Profile creation failed after signup:", profileError.message);
      redirect("/signup?error=profile");
    }
  }

  redirect("/");
}

export default async function SignUpPage({ searchParams }) {
  // ?error=true is set by signUp when Supabase says no
  const { error } = await searchParams;

  return (
    <main>
      <h1>Sign up</h1>
      {error && (
        <p className="form-error" role="alert">
          {error === "usernameFormat"
            ? "Brugernavnet skal være 3-20 tegn og kun indeholde bogstaver, tal eller underscore."
            : error === "usernameTaken"
              ? "Brugernavnet er allerede taget. Vælg et andet."
              : error === "profile"
                ? "Brugernavnet kunne ikke gemmes. Kontrollér profiles-tabellen og dens RLS-politikker."
                : "Could not sign up. Maybe the email is already in use."}
        </p>
      )}
      <form action={signUp} className="auth-form">
        <label htmlFor="username">Brugernavn</label>
        <input
          id="username"
          name="username"
          type="text"
          placeholder="fx mariaskov12"
          autoComplete="username"
          minLength={3}
          maxLength={20}
          pattern="[A-Za-z0-9_]{3,20}"
          required
        />

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

        <button type="submit">Sign up</button>
      </form>
      <p>
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </main>
  );
}
