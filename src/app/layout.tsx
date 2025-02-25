import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Notate",
  description: "The homework submission platform that just works.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{colorScheme: "dark"}} className="dark">
      <body>
        {children}
      </body>
    </html>
  );
}
