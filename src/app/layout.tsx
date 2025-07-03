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
  title: "TREC | Sales",
  description: "Developed by TREC ",
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
        {/* Wrap children with ProtectedRoute for authentication */}
     
         
        
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