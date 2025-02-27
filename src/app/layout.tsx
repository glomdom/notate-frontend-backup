"use client";

import "./globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProvider } from "@/providers/app-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Notate</title>
      </head>
      <body>
        <ThemeProvider attribute={"class"} defaultTheme="system" enableSystem>
          <QueryClientProvider client={queryClient}>
            <AppProvider>
              <ThemeToggle />
              {children}
            </AppProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
