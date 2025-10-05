import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NotificationProvider } from "../contexts/NotificationContext";
import { UserProvider } from "../contexts/UserContext";
import "./globals.css";
import { AuthProvider } from "./modules/auth/presentation/providers/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Strading",
  description: "Strading application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <UserProvider>
            <NotificationProvider>{children}</NotificationProvider>
          </UserProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
