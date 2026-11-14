import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VYRA ADMIN",
  description: "Private administration workspace for VYRA",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl"><body>{children}</body></html>;
}
