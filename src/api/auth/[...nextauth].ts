import NextAuth from 'next-auth';
import AzureADProvider from 'next-auth/providers/azure-ad';

const clientId = process.env.AZURE_AD_CLIENT_ID;
const clientSecret = process.env.AZURE_AD_CLIENT_SECRET;
const tenantId = process.env.AZURE_AD_TENANT_ID;

if (!clientId || !clientSecret || !tenantId) {
  throw new Error('Azure AD credentials are not properly set in environment variables.');
}

export default NextAuth({
  providers: [
    AzureADProvider({
      clientId,
      clientSecret,
      tenantId,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.accessToken = token.accessToken as string;
      return session;
    },
  },
});
