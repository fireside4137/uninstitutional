import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  examPortal: z.string().optional(),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        examPortal: { label: "Exam Portal", type: "text" },
      },
      async authorize(credentials) {
        // Validate input shape
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password, examPortal } = parsed.data;

        // Find user in DB
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) return null;
        if (!user.isVerified) return null;
        if (user.isDeleted) return null;

        // Verify that the user's exam matches the portal they are logging into
        if (examPortal && user.examType !== examPortal) {
          return null;
        }

        // Check password
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          examType: user.examType,
          language: user.language,
          role: user.role,
          isPremium: user.isPremium,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // On first login, attach only minimal fields to token — NO image/Base64
      if (user) {
        token.id = user.id;
        const u = user as { examType?: string; language?: string; role?: string; isPremium?: boolean };
        token.examType = u.examType;
        token.language = u.language;
        token.role = u.role;
        token.isPremium = u.isPremium;
        // Explicitly clear picture to prevent any adapter from injecting it
        token.picture = undefined;
      }
      return token;
    },
    async session({ session, token }) {
      // Expose token fields to session — NO image
      if (token && session.user) {
        session.user.id = token.id as string;
        const sUser = session.user as { examType?: unknown; language?: unknown; role?: unknown; isPremium?: unknown; image?: string | null };
        sUser.examType = token.examType;
        sUser.language = token.language;
        sUser.role = token.role;
        sUser.isPremium = token.isPremium;
        sUser.image = null; // Never store image in session — fetched from API instead
      }
      return session;
    },
  },
});