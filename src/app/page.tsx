import { auth } from "@clerk/nextjs"
import { redirect } from "next/navigation"

export default function Home() {
  const { userId } = auth()

  if (userId) {
    redirect("/overview")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="mb-8 text-4xl font-bold">IoT Pig Monitoring System</h1>
      <p className="mb-8 text-center text-lg text-gray-600 dark:text-gray-400">
        Please sign in to access the monitoring system.
      </p>
      <a
        href="/sign-in"
        className="rounded-md bg-indigo-600 px-6 py-3 text-white transition hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
      >
        Sign In
      </a>
    </div>
  )
}