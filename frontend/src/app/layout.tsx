import type { ReactNode } from "react";
import { Providers } from "./providers";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}