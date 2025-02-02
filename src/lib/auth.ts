import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('이메일 주소와 비밀번호를 입력해주세요.');
        }

        const user = await prisma.users.findUnique({
          where: { 
            email: credentials.email,
            useYn: 'Y'
          }
        });

        if (!user) {
          throw new Error('등록되지 않은 이메일 주소입니다.');
        }

        if (user.password !== credentials.password) {
          throw new Error('비밀번호가 일치하지 않습니다.');
        }

        return {
          id: String(user.id),
          email: user.email,
          name: user.name
        };
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
      }
      return session;
    }
  }
}; 