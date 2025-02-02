import "next-auth";
import { JWT } from "next-auth/jwt";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    phoneNumber?: string;
  }
  
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      phoneNumber?: string;
    } & DefaultSession["user"]
  }

  interface JWT {
    id: string;
    email: string;
    name: string;
    phoneNumber?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    phoneNumber?: string;
  }
} 