import type { Metadata } from "next";
import "./globals.css";
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Graduate&family=Inter:wght@400;500;600;700;800;900&family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#080604] text-white">
        {children}
      </body>
    </html>
  );
}
