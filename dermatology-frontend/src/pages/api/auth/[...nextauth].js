import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

export default NextAuth({
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          // Define the backend URL (make sure this matches your environment variables)
          const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";

          // Make an API call to your backend to authenticate the user
          const response = await axios.post(`${backendUrl}/api/auth/login`, {
            email: credentials.email,
            password: credentials.password
          });

          const data = response.data;

          // If the response does not include a token, authentication failed
          if (!data?.token) {
            throw new Error("Authentication failed: No token received");
          }

          // Return the user data and token to NextAuth
          return {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            token: data.token,  // Include the token in the user object
          };
        } catch (error) {
          console.error("Authorization error:", error);
          throw new Error(
            error.response?.data?.error || error.message || "Login failed. Please check your credentials."
          );
        }
      }
    })
  ],

  // Specify the pages for authentication
  pages: {
    signIn: "/login", // Custom login page (if needed)
    error: "/login?error=auth" // Redirect to the error page on failure
  },

  // JWT session management
  session: {
    strategy: "jwt", // Use JWT to store session data
    maxAge: 24 * 60 * 60, // Session expiry (24 hours)
  },

  // Callbacks to manipulate JWT and session data
  callbacks: {
    async jwt({ token, user }) {
      // If a user is authenticated, save their token in the JWT
      if (user) {
        token.accessToken = user.token; // Save the token to the JWT
      }
      return token;
    },
    async session({ session, token }) {
      // Attach the JWT token to the session object
      session.accessToken = token.accessToken; // Attach accessToken to session
      return session;
    }
  },

  // Secret for JWT encryption
  secret: process.env.NEXTAUTH_SECRET,

  // Enable debugging for development
  debug: process.env.NODE_ENV === "development"
});
