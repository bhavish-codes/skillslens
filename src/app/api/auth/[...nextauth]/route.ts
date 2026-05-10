import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/mongodb";
import { User } from "@/models";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
        name: { label: "Name", type: "text" },
        action: { label: "Action", type: "text" }, // "signup" or "login"
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          await dbConnect();

          const existingUser = await User.findOne({ email: credentials.email });

          if (credentials.action === "signup") {
            if (existingUser) {
              // Return null with a custom error via the URL
              throw new Error("User already exists. Please log in.");
            }
            const hashedPassword = await bcrypt.hash(credentials.password, 10);
            const newUser = await User.create({
              email: credentials.email,
              passwordHash: hashedPassword,
              name: credentials.name || credentials.email.split("@")[0],
              role: credentials.role || "recruiter",
            });
            return {
              id: newUser._id.toString(),
              email: newUser.email,
              name: newUser.name,
              role: (newUser as any).role,
            };
          } else {
            // Login flow
            if (!existingUser) {
              throw new Error("No account found. Please sign up.");
            }
            const isValid = await bcrypt.compare(
              credentials.password,
              existingUser.passwordHash
            );
            if (!isValid) {
              throw new Error("Invalid password.");
            }
            return {
              id: existingUser._id.toString(),
              email: existingUser.email,
              name: existingUser.name,
              role: existingUser.role,
            };
          }
        } catch (error: any) {
          // NextAuth v4 in App Router: throw errors as-is so they surface in res.error
          throw new Error(error.message || "Authentication failed");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
