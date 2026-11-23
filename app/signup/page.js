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
  const username = typeof rawUsername === "string" ? rawUsername.trim() : "";

  if (!username) {
    redirect("/signup?error=username-empty");
  }

  const supabase = await createClient();
  const { data: profiles, error: lookupError } = await supabase
    .from("profiles")
    .select("username");

  if (lookupError) {
    console.error("Supabase username lookup failed:", lookupError.message);
    redirect("/signup?error=profile");
  }

  const normalizedUsername = username.toLocaleLowerCase("da-DK");
  const usernameTaken = profiles?.some(
    (profile) => profile.username?.trim().toLocaleLowerCase("da-DK") === normalizedUsername,
  );

  if (usernameTaken) {
    redirect("/signup?error=username-taken");
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });

  // Show the Auth error on the form so it is clear why signup failed.
  if (error) {
    console.error("Supabase sign-up failed:", error.message);
    redirect("/signup?error=signup");
  }

  if (data.user && data.session) {
    const { error: profileError } = await supabase.from("profiles").upsert(
      { id: data.user.id, username },
      { onConflict: "id" },
    );

    if (profileError) {
      console.error("Supabase profile creation failed:", profileError.message);
      if (profileError.code === "23505") {
        redirect("/signup?error=username-taken");
      }
      redirect("/signup?error=profile");
    }
  }

  if (data.session) {
    redirect("/");
  }

  redirect("/login?confirmation=true");
}

export default async function SignUpPage({ searchParams }) {
  // The signup action places Supabase's error message in the URL.
  const { error } = await searchParams;
  const errorMessages = {
    "username-empty": "Skriv et brugernavn.",
    "username-taken": "Brugernavnet er allerede taget.",
    profile: "Brugernavnet kunne ikke gemmes. Prøv igen senere.",
    signup: "Brugeren kunne ikke oprettes. Kontrollér oplysningerne, og prøv igen.",
  };
  return (
    <main>
      <h1>Sign up</h1>
      {error && (
        <p className="form-error" role="alert">
          {errorMessages[error] || "Kunne ikke oprette brugeren."}
        </p>
      )}
      <form action={signUp} className="auth-form">
        <label htmlFor="username">Brugernavn</label>
        <input
          id="username"
          name="username"
          type="text"
          placeholder="Vælg et brugernavn"
          autoComplete="username"
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
