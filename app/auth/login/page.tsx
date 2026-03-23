'use client'

/**
 * Login Page Component
 * 
 * Provides user authentication interface
 * - Form for email and password input
 * - Form validation and error handling
 * - JWT token storage in localStorage for authenticated requests
 * - Responsive design for mobile and desktop
 * 
 * Features:
 * - Client-side form validation
 * - Error messages display
 * - Loading state during submission
 * - Link to signup page for new users
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  // State management for form inputs
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  // State for error messages
  const [error, setError] = useState('')
  
  // State for loading indication during API call
  const [isLoading, setIsLoading] = useState(false)
  
  // Router for navigation after successful login
  const router = useRouter()

  /**
   * Handle form submission
   * Validates inputs, sends credentials to API, stores token, and redirects
   */
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Clear previous error messages
    setError('')
    setIsLoading(true)

    try {
      // Send login credentials to backend API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      // Parse the response
      const data = await response.json()

      // Check if login was successful
      if (!data.success) {
        setError(data.message || 'Login failed')
        setIsLoading(false)
        return
      }

      // Store JWT token in localStorage for authenticated requests
      localStorage.setItem('token', data.token)
      
      // Store user info for quick access
      localStorage.setItem('user', JSON.stringify(data.user))

      // Redirect based on user role
      // Admin and Warden go to dashboard, Student goes to portal
      if (data.user.role === 'student') {
        router.push('/student-portal')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      // Handle network or other errors
      setError('An error occurred. Please try again.')
      console.error('Login error:', err)
    } finally {
      // Stop loading state regardless of success or failure
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4 py-8">
      {/* Container with max width for desktop, full width for mobile */}
      <div className="w-full max-w-md">
        {/* Main form card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Header section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Login
            </h1>
            <p className="text-gray-600">
              Access your hostel management account
            </p>
          </div>

          {/* Error message display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email input field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full"
              />
            </div>

            {/* Password input field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full"
              />
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 mt-6"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <div className="px-3 text-gray-500 text-sm">or</div>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Link to signup page for new users */}
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-3">
              Don't have an account?
            </p>
            <Link
              href="/auth/signup"
              className="inline-block w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* Footer text for context */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">
            Hostel Management System
          </p>
        </div>
      </div>
    </div>
  )
}
