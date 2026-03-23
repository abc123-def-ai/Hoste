'use client'

/**
 * Home Page
 * 
 * Landing page that handles authentication redirects
 * - Redirects authenticated users to appropriate dashboard
 * - Shows login/signup options for unauthenticated users
 * - Responsive design
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  const { isAuthenticated, user, isLoading } = useAuth()
  const router = useRouter()

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (user?.role === 'student') {
        router.push('/student-portal')
      } else {
        router.push('/dashboard')
      }
    }
  }, [isLoading, isAuthenticated, user, router])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  // Landing page for unauthenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col">
      {/* Header navigation */}
      <header className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">
            🏢 Hostel Management System
          </h1>
          <div className="flex gap-3">
            <Link
              href="/auth/login"
              className="px-6 py-2 text-white hover:text-gray-200 font-medium transition-colors"
            >
              Login
            </Link>
            <Link
              href="/auth/signup"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Main hero section */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero heading */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            Manage Your Hostel with Ease
          </h2>

          {/* Hero subheading */}
          <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            A comprehensive solution for student hostel management. 
            Manage blocks, rooms, students, payments, and more with a single unified platform.
          </p>

          {/* Features section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
            {/* Feature 1 */}
            <div className="bg-white/10 backdrop-blur p-6 rounded-lg border border-white/20">
              <div className="text-3xl mb-3">👥</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                User Management
              </h3>
              <p className="text-gray-400">
                Easily manage students, wardens, and admin staff with role-based access control.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/10 backdrop-blur p-6 rounded-lg border border-white/20">
              <div className="text-3xl mb-3">🏢</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Block Management
              </h3>
              <p className="text-gray-400">
                Organize hostel blocks, assign wardens, and track room allocations efficiently.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/10 backdrop-blur p-6 rounded-lg border border-white/20">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Payment Tracking
              </h3>
              <p className="text-gray-400">
                Monitor hostel fees, maintenance charges, and payment statuses in real-time.
              </p>
            </div>
          </div>

          {/* Additional features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 text-left max-w-2xl mx-auto">
            <div className="flex items-center gap-3">
              <span className="text-green-400 text-xl">✓</span>
              <span className="text-gray-300">Room allocation and assignment</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-400 text-xl">✓</span>
              <span className="text-gray-300">Maintenance request tracking</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-400 text-xl">✓</span>
              <span className="text-gray-300">Visitor management system</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-400 text-xl">✓</span>
              <span className="text-gray-300">Detailed analytics and reports</span>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/auth/signup"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-3 bg-white/20 hover:bg-white/30 text-white border border-white/40 rounded-lg font-semibold transition-colors"
            >
              Login to Account
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 px-4 sm:px-6 lg:px-8 py-8 mt-auto">
        <div className="max-w-7xl mx-auto text-center text-gray-400 text-sm">
          <p>
            © 2026 Hostel Management System. Built with modern web technologies for better hostel management.
          </p>
        </div>
      </footer>
    </div>
  )
}
