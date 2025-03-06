import type { Metadata } from "next"
import { ThemeProvider } from "next-themes"
// import { Inter } from "next/font/google"
import { GeistSans } from "geist/font/sans"
import "./globals.css"
import { siteConfig } from "./siteConfig"
import { ClerkProvider } from "@clerk/nextjs"

import { Sidebar } from "@/components/ui/navigation/Sidebar"

// const inter = Inter({
//   subsets: ["latin"],
//   display: "swap",
//   variable: "--font-inter",
// })

export const metadata: Metadata = {
  metadataBase: new URL("https://yoururl.com"),
  title: siteConfig.name,
  description: siteConfig.description,
  keywords: [],
  authors: [
    {
      name: "yourname",
      url: "",
    },
  ],
  creator: "yourname",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${GeistSans.className}  overflow-y-scroll scroll-auto antialiased selection:bg-indigo-100 selection:text-indigo-700 dark:bg-gray-950`}
          suppressHydrationWarning
        >
          <div className="mx-auto max-w-screen-2xl">
            <ThemeProvider defaultTheme="system" attribute="class">
              <Sidebar />
              <main className="lg:pl-72">{children}</main>
            </ThemeProvider>
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}