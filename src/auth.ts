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
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // On first login, attach extra fields to token
      if (user) {
        token.id = user.id;
        const u = user as { examType?: string; language?: string; role?: string; image?: string | null };
        token.examType = u.examType;
        token.language = u.language;
        token.role = u.role;
        token.picture = u.image;
      }
      // Support session updates
      if (trigger === "update" && session) {
        if (session.image !== undefined) {
          token.picture = session.image;
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Expose token fields to session
      if (token && session.user) {
        session.user.id = token.id as string;
        const sUser = session.user as { examType?: unknown; language?: unknown; role?: unknown; image?: string | null };
        sUser.examType = token.examType;
        sUser.language = token.language;
        sUser.role = token.role;
        sUser.image = token.picture as string | null;
      }
      return session;
    },
  },
});