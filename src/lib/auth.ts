import { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";

declare module "next-auth" {
  interface Session {
      user: {
        id: string;
        email: string;
        name: string;
        phoneNumber?: string;
        image?: string;
      }

    }

    interface User {
      id: string;
      email: string;
      name: string;
      image?: string;
    }
  }

  declare module "next-auth/jwt" {
    interface JWT {
      id: string;
      email: string;
      name: string;
      phoneNumber?: string;
      image?: string;
    }
  }

  export const authOptions: NextAuthOptions = {
    providers: [
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "text" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials): Promise<User | null> {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('이메일과 비밀번호를 입력해주세요.');
          }

          try {
            const user = await prisma.users.findUnique({
              where: { 
                email: credentials.email,
                password: credentials.password  // 암호화 없이 직접 비교
              },
              select: {
                id: true,
                email: true,
                name: true,
                phoneNumber: true,
                image: true
              }
            });

            if (!user) {
              throw new Error('이메일 또는 비밀번호가 일치하지 않습니다.');
            }

            return {
              id: user.id.toString(),
              email: user.email,
              name: user.name,
              phoneNumber: user.phoneNumber || undefined,
              image: user.image || undefined
            };
          } catch (error) {
            console.error("Auth error:", error);
            throw error;
          }
        }
      })
    ],
    pages: {
      signIn: '/login',
    },
    session: {
      strategy: "jwt",
    },
    callbacks: {
      async jwt({ token, user, trigger, session: updatedSession }) {
        if (user) {
          token.id = user.id;
          token.email = user.email;
          token.name = user.name;
        }

        // updateSession(updatedSession) 호출 시 토큰 정보도 업데이트 (최소한의 정보만)
        if (trigger === "update" && updatedSession) {
          if (updatedSession.name) token.name = updatedSession.name;
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          session.user.id = token.id as string;
          session.user.email = token.email as string;
          session.user.name = token.name as string;
          // phoneNumber와 image는 API를 통해 별도로 가져오도록 변경
        }
        return session;
      }
    },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}; 