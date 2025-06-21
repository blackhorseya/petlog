import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Auth0Provider } from "@auth0/nextjs-auth0";

import { ThemeProvider } from "@/hooks/use-theme";
import { AppLayout } from "@/components/layout/app-layout";
import { QueryProvider } from "@/components/providers/query-provider";
import { ToasterProvider } from "@/components/providers/toaster-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PetLog - 寵物健康管理系統",
  description: "追蹤您的寵物健康與生活記錄，讓愛寵更健康快樂。",
  keywords: ["寵物", "健康管理", "醫療記錄", "寵物日記"],
  authors: [{ name: "PetLog Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body className={inter.className}>
        <Auth0Provider>
          <QueryProvider>
            <ThemeProvider defaultTheme="system" storageKey="petlog-ui-theme">
              <AppLayout>{children}</AppLayout>
              <ToasterProvider />
            </ThemeProvider>
          </QueryProvider>
        </Auth0Provider>
      </body>
    </html>
  );
}
