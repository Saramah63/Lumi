import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Lumi Teacher Mode",
  description: "Finnish kindergarten emotional intelligence assistant",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fi">
      <body>{children}</body>
    </html>
  );
}
