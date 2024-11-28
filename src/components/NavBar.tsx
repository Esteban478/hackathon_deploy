import Link from "next/link"
import Image from 'next/image'
// import { getServerSession } from "next-auth"
// import { SignInButton } from "./auth/SignInButton"
// import { SignOutButton } from "./auth/SignOutButton"

export default async function Navbar() {
//   const session = await getServerSession()

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold">
              <Image
                src="/logo.png"
                width={60}
                height={50}
                alt="HopIn Morris Logo"
              />
            </Link>
            <Link href="/" className="hover:text-blue-600">
              Home
            </Link>
            <Link href="/rides" className="hover:text-blue-600">
              Rides
            </Link>
            <Link href="/analytics" className="hover:text-blue-600">
              Analytics
            </Link>
            <Link href="/chat" className="hover:text-blue-600">
            Chat
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}