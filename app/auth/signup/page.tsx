'use client'

/**
 * Signup Page Component
 * 
 * Provides user registration interface for three user types:
 * - Students: with student ID requirement
 * - Wardens: hostel management staff
 * - Admins: system administrators
 * 
 * Features:
 * - Role-based form fields (student ID only shows for students)
 * - Form validation with error handling
 * - Password strength considerations
 * - Automatic login after registration
 * - Responsive mobile-first design
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type UserRole = 'student' | 'warden' | 'admin'

export default function SignupPage() {
  // Form input states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [phone, setPhone] = useState('')
  
  // User role selection state
  const [role, setRole] = useState<UserRole>('student')
  
  // Error and loading states
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  // Router for navigation after successful signup
  const router = useRouter()

  /**
   * Validate form inputs before submission
   * Checks for required fields, password match, and format
   */
  const validateForm = (): boolean => {
    // Check all required fields are filled
    if (!email || !password || !name) {
      setError('Email, password, and name are required')
      return false
    }

    // Check passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return false
    }

    // Check password length (minimum 6 characters)
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }

    // For students, require student ID
    if (role === 'student' && !studentId) {
      setError('Student ID is required')
      return false
    }

    return true
  }

  /**
   * Handle form submission
   * Validates input, sends to API, stores token, and redirects
   */
  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Clear previous errors
    setError('')
    
    // Validate before making API call
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Send registration data to backend API
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name,
          role,
          studentId: role === 'student' ? studentId : undefined,
          phone: phone || undefined,
        }),
      })

      // Parse API response
      const data = await response.json()

      // Check if registration was successful
      if (!data.success) {
        setError(data.message || 'Signup failed')
        setIsLoading(false)
        return
      }

      // Store JWT token for authenticated requests
      localStorage.setItem('token', data.token)
      
      // Store user info for quick access
      localStorage.setItem('user', JSON.stringify(data.user))

      // Redirect based on user role
      if (data.user.role === 'student') {
        router.push('/student-portal')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      // Handle network or other errors
      setError('An error occurred. Please try again.')
      console.error('Signup error:', err)
    } finally {
      // Stop loading state
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4 py-8">
      {/* Container with responsive padding */}
      <div className="w-full max-w-md">
        {/* Main signup card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Header section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create Account
            </h1>
            <p className="text-gray-600">
              Join the hostel management system
            </p>
          </div>

          {/* Error message display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Signup form */}
          <form onSubmit={handleSignup} className="space-y-4">
            {/* Name input field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
                className="w-full"
              />
            </div>

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

            {/* Role selection - radio buttons for different user types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Account Type
              </label>
              <div className="space-y-2">
                {/* Student role option */}
                <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={role === 'student'}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    disabled={isLoading}
                    className="w-4 h-4"
                  />
                  <span className="ml-3 text-sm text-gray-700">Student</span>
                </label>

                {/* Warden role option */}
                <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="radio"
                    name="role"
                    value="warden"
                    checked={role === 'warden'}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    disabled={isLoading}
                    className="w-4 h-4"
                  />
                  <span className="ml-3 text-sm text-gray-700">Warden</span>
                </label>

                {/* Admin role option */}
                <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={role === 'admin'}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    disabled={isLoading}
                    className="w-4 h-4"
                  />
                  <span className="ml-3 text-sm text-gray-700">Admin</span>
                </label>
              </div>
            </div>

            {/* Conditionally show Student ID field only for students */}
            {role === 'student' && (
              <div>
                <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">
                  Student ID
                </label>
                <Input
                  id="studentId"
                  type="text"
                  placeholder="STU001234"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  required={role === 'student'}
                  disabled={isLoading}
                  className="w-full"
                />
              </div>
            )}

            {/* Optional phone field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number (Optional)
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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
              <p className="text-xs text-gray-500 mt-1">
                At least 6 characters
              </p>
            </div>

            {/* Confirm password field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <div className="px-3 text-gray-500 text-sm">or</div>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Link to login page for existing users */}
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-3">
              Already have an account?
            </p>
            <Link
              href="/auth/login"
              className="inline-block w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Login Here
            </Link>
          </div>
        </div>

        {/* Footer text */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">
            Hostel Management System
          </p>
        </div>
      </div>
    </div>
  )
}
