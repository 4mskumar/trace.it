import { createHash } from "crypto";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth, { type NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email repo",
        },
      },
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        verificationToken: { label: "Verification token", type: "text" },
      },
      async authorize(credentials) {
        // ... (Keep your existing credentials & verification token code as is)
        const email = typeof credentials?.email === "string" ? credentials.email.trim().toLowerCase() : "";
        const rawToken = typeof credentials?.verificationToken === "string" ? credentials.verificationToken : "";

        if (rawToken) {
          if (!email || !/^[a-f0-9]{64}$/i.test(rawToken)) return null;
          const tokenHash = createHash("sha256").update(rawToken).digest("hex");
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) return null;

          await prisma.$transaction(async (tx) => {
            const consumed = await tx.verificationToken.deleteMany({
              where: { identifier: email, token: tokenHash, expires: { gt: new Date() } },
            });
            if (consumed.count !== 1) throw new Error("INVALID_VERIFICATION_TOKEN");

            await tx.user.update({
              where: { id: user.id },
              data: { emailVerified: user.emailVerified ?? new Date() },
            });
          });

          return { id: user.id, email: user.email, name: user.name, image: user.image };
        }

        const password = typeof credentials?.password === "string" ? credentials.password : "";
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.password || !user.emailVerified) return null;

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return null;

        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
  ],

  pages: {
    signIn: "/sign-in",
    error: "/auth/error",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, account, user }) {
      // 1. If user logs in or re-authenticates via GitHub
      if (account && account.provider === "github") {
        token.accessToken = account.access_token;
        token.provider = account.provider;

        // If user object exists in JWT context, update database status immediately
        if (token.sub) {
          await prisma.user.update({
            where: { id: token.sub },
            data: { 
              isGithubConnected: true,
              // If account has an expires_at from GitHub oauth, save it to handle expiration checks later
              githubTokenExpiresAt: account.expires_at ? new Date(account.expires_at * 1000) : null 
            },
          });
        }
      }

      if (user) {
        token.id = user.id;
      }

      // 2. Fetch latest DB state for isGithubConnected to keep token fresh
      if (token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { isGithubConnected: true, githubTokenExpiresAt: true },
        });

        if (dbUser) {
          // Check if token expiration date has passed
          const isExpired = dbUser.githubTokenExpiresAt ? new Date() > dbUser.githubTokenExpiresAt : false;
          
          if (isExpired && dbUser.isGithubConnected) {
            // Mark as disconnected if expired
            await prisma.user.update({
              where: { id: token.sub },
              data: { isGithubConnected: false },
            });
            token.isGithubConnected = false;
          } else {
            token.isGithubConnected = dbUser.isGithubConnected;
          }
        }
      }

      return token;
    },

    // Inside your authOptions callbacks object:
async session({ session, token }) {
  if (session.user && token.sub) {
    // Always fetch the latest user data from the database
    const freshUser = await prisma.user.findUnique({
      where: { id: token.sub },
      select: { name: true, email: true, image: true },
    });

    if (freshUser) {
      session.user.name = freshUser.name;
      session.user.email = freshUser.email;
      session.user.image = freshUser.image;
    }
    
    session.user.id = token.id as string;
    (session.user as any).isGithubConnected = token.isGithubConnected ?? false;
  }

  (session as any).accessToken = token.accessToken;
  return session;
},
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };