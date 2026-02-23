import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SidebarProvider } from "@/components/layout/SidebarContext";
import Sidebar from "@/components/layout/Sidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Pipeline Monitor",
    template: "%s | Pipeline Monitor",
  },
  description: "Real-time ETL pipeline observability dashboard — monitor pipeline health, run history, latency trends and alerts in one place.",
  openGraph: {
    title: "Pipeline Monitor",
    description: "Real-time ETL pipeline observability dashboard.",
    type: "website",
    locale: "en_US",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} antialiased bg-[#0d1117] text-zinc-100 flex`}
      >
        <SidebarProvider>
          <Sidebar />
          <div className="flex-1 flex flex-col min-h-screen min-w-0">
            {children}
          </div>
        </SidebarProvider>
        <Analytics />
      </body>
    </html>
  );
}
