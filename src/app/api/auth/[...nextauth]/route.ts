import GoogleProvider from "next-auth/providers/google";
import { connectViaMongoose } from "@/lib/db";
import User, { IUser } from "@/models/User";
import bcrypt from "bcryptjs";
import NextAuth, { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(
        credentials: Record<"email" | "password", string> | undefined
      ) {
        if (!credentials?.email || !credentials?.password) return null;
        await connectViaMongoose();
        const user = await User.findOne({ email: credentials.email });
        if (!user || !user.passwordHash) return null;
        const ok = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        if (!ok) return null;
        return {
          id: String(user._id),
          email: user.email,
          username: user.username,
          image: user.avatarUrl,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      const email = user?.email || token?.email;
      if (email) {
        await connectViaMongoose();
        const dbUser = await User.findOne({ email });
        if (dbUser) {
          token.uid = String(dbUser._id);
        }
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token?.uid) {
        session.userId = token.uid;
        session.id = token.uid;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
