import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          if (!credentials?.email || !credentials?.password) {
            
            return null;
          }

          // Note: Use internal docker URL if available, else fallback to public/localhost
          const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
          
          const res = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            }),
            headers: { "Content-Type": "application/json" }
          })
          
          if (!res.ok) return null

          const data = await res.json()
          
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.firstName, 
            accessToken: data.accessToken, 
          }
        } catch (e) {
          console.error("returning null from authorize due to error", e);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google-sync`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
            }),
          }
        );

        if (!res.ok) return false;

        const data = await res.json();

        user.id = data.user.id;
        user.accessToken = data.accessToken;
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.accessToken = user.accessToken;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.accessToken = token.accessToken;
      }
      return session;
    },
  }

})