import type { Metadata } from "next";
import "./tailwind-built.css";

export const metadata: Metadata = {
  title: "Rajgir Marathon — Run Through History | Official Platform",
  description:
    "Official digital platform for the Rajgir Marathon. Connects runners, volunteers, sponsors, expo vendors, and tourism partners in the historic city of Rajgir, Bihar.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#080604] text-white">
        {children}
      </body>
    </html>
  );
}
