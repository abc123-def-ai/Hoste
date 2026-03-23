/**
 * Authentication Hook (use-auth)
 * 
 * Provides authentication state management for components
 * Handles reading user data from localStorage and checking authentication status
 * 
 * Usage:
 * const { user, token, logout } = useAuth()
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'warden' | 'student'
}

/**
 * Hook to manage authentication state
 * Returns user info, token, and logout function
 */
export function useAuth() {
  // State for authenticated user
  const [user, setUser] = useState<User | null>(null)
  
  // State for JWT token
  const [token, setToken] = useState<string | null>(null)
  
  // State for loading during initialization
  const [isLoading, setIsLoading] = useState(true)
  
  // Router for redirects
  const router = useRouter()

  // Initialize auth state on component mount
  useEffect(() => {
    try {
      // Get token from localStorage
      const storedToken = localStorage.getItem('token')
      
      // Get user data from localStorage
      const storedUser = localStorage.getItem('user')

      // Set state if both exist
      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      }
    } catch (error) {
      console.error('Error loading auth state:', error)
    } finally {
      // Stop loading regardless of success
      setIsLoading(false)
    }
  }, [])

  /**
   * Logout function
   * Clears token and user data from localStorage
   * Redirects to login page
   */
  const logout = () => {
    // Clear stored authentication data
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    // Clear state
    setUser(null)
    setToken(null)
    
    // Redirect to login
    router.push('/auth/login')
  }

  /**
   * Check if user is authenticated
   * Returns true if token and user exist
   */
  const isAuthenticated = !!token && !!user

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    logout,
  }
}
