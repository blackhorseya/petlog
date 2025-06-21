import { Auth0Client } from "@auth0/nextjs-auth0/server";

const issuerBaseURL = process.env.AUTH0_ISSUER_BASE_URL;

const appBaseUrl =
  process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_BRANCH_URL
    ? `https://${process.env.VERCEL_BRANCH_URL}`
    : process.env.AUTH0_BASE_URL;

export const auth0 = new Auth0Client({
  domain: new URL(issuerBaseURL!).host,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  appBaseUrl: appBaseUrl,
  secret: process.env.AUTH0_SECRET,
  authorizationParameters: {
    scope: "openid profile email offline_access",
    audience: process.env.AUTH0_AUDIENCE,
  },
});
