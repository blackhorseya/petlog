import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Auth0Provider } from "@auth0/nextjs-auth0";
import { auth0 } from "@/lib/auth0";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PetLog",
  description: "Track your pet's health and wellness.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth0.getSession();

  return (
    <html lang="en">
      <Auth0Provider user={session?.user}>
        <body className={inter.className}>{children}</body>
      </Auth0Provider>
    </html>
  );
}
