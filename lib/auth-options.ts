import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";

// Helper: sign in with Firebase Auth REST (email/password)
async function firebaseSignInWithPassword(email: string, password: string) {
  const apiKey = process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) throw new Error("Missing FIREBASE_API_KEY/NEXT_PUBLIC_FIREBASE_API_KEY env");
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || "Invalid credentials");
  }
  return data;
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: Record<string, string> | undefined) {
        try {
          if (!credentials?.email || !credentials?.password) return null;
          const data = await firebaseSignInWithPassword(credentials.email, credentials.password);
          return {
            id: data.localId,
            name: data.email?.split("@")[0] || "User",
            email: data.email,
            image: null,
            idToken: data.idToken,
            refreshToken: data.refreshToken,
          } as any;
        } catch (e) {
          console.error("Credentials authorize error", e);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" as const },
  pages: { signIn: "/auth" },
  callbacks: {
    async jwt({ token, user, account }: any) {
      if (user) {
        token.uid = (user as any).id || token.uid;
        token.picture = user.image || token.picture;
        token.idToken = (user as any).idToken || token.idToken;
      }
      if (account) token.provider = account.provider;
      return token;
    },
    async session({ session, token }: any) {
      if (session?.user) {
        (session.user as any).id = token.uid;
        (session.user as any).picture = token.picture;
        (session.user as any).provider = token.provider;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
} as const;
