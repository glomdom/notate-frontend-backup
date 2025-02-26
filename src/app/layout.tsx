"use client";

// import type { Metadata } from "next";
import "./globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProvider } from "@/providers/app-provider";

// export const metadata: Metadata = {
//   title: "Notate",
//   description: "The homework submission platform that just works.",
// };

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ colorScheme: "dark" }} className="dark">
      <body>
        <QueryClientProvider client={queryClient}>
          <AppProvider>
            {children}
          </AppProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
