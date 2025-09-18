import { connectViaMongoose } from "@/lib/db";
import User, { IUser } from "@/models/User";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const handler = NextAuth({
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
        const user = (await User.findOne({
          email: credentials.email,
        }).lean()) as IUser | null;
        if (!user || !user.passwordHash) return null;
        const ok = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        if (!ok) return null;
        return {
          id: String(user._id),
          username: user.username,
          email: user.email,
          image: user.avatarUrl,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) token.uid = user.id;
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token?.uid) session.userId = token.uid;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
