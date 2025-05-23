import NextAuth from "next-auth"
import GoogleProvider from 'next-auth/providers/google';

const authOptions = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async redirect({ baseUrl }) {
      return baseUrl + '/dashboard'; 
    },
  },
})

export {authOptions as GET, authOptions as POST}