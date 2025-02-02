import { NextAuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      phoneNumber?: string;
    } & DefaultSession["user"]
  }

  interface User {
    id: string;
    email: string;
    name: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name: string;
  }
}

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

        // 패스워드 검증 (현재는 plain text 비교)
        if (user.password !== credentials.password) {
            throw new Error('비밀번호가 일치하지 않습니다.');
        }
  
         /* 나중에 bcrypt 사용 시 아래 코드로 변경
          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );
          
          if (!isValid) {
            throw new Error('비밀번호가 일치하지 않습니다.');
          }
          */

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
    signOut: '/login',
    error: '/login',  // 에러 발생시 리다이렉트
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30일
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.phoneNumber = user.phoneNumber;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.phoneNumber = token.phoneNumber as string;
      }
      return session;
    }
  }
}; 