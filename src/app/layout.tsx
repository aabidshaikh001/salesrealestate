import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ClientWrapper from "./component/ClientWrapper"; // Import the ClientWrapper
import { AuthProvider } from "@/providers/auth-provider"
import { TooltipProvider } from "@/components/ui/tooltip"; // Adjust the import path as needed
import { ToastContainer } from "react-toastify";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
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
      > <AuthProvider>
        <TooltipProvider>
        {/* Wrap children with ClientWrapper */}
        <ClientWrapper>
          <ToastContainer
            position="top-right"
            autoClose={5000}
           
          />
          {children}
         
          </ClientWrapper>
        </TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}