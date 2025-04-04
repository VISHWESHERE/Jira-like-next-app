import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions = {
  providers: [
    CredentialsProvider({
        name: 'Credentials',
        credentials: {
          email: { label: "email", type: "email" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials, req) {
          const users = [
            { id: 1, name: 'vignesh', email: 'vignesh@gmail.com', password: 'test@1234' },
            { id: 2, name: 'vishwesh', email: 'vishwesh@gmail.com', password: 'test@1234'}
          ]
        
          // Corrected find method - either use implicit return or explicit return
          const findUser = users.find(user => 
            user.email === credentials.email && user.password === credentials.password
          );

          if (findUser) {
            return findUser;
          }
          return null;
        }
      })
  ],
  secret: "omnamahsihvaya",
}

export default NextAuth(authOptions)