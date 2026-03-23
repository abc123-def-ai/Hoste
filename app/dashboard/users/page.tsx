'use client'

/**
 * User Management Page
 * 
 * Full-featured user management interface for admins
 * - View all users with pagination
 * - Filter by role (admin, warden, student)
 * - Search by name or email
 * - Responsive table design (mobile-friendly)
 * - Sort by creation date
 * 
 * Features:
 * - Pagination controls
 * - Role-based filtering
 * - Search functionality
 * - Status indicators
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface User {
  id: string
  email: string
  name: string
  role: string
  student_id?: string
  phone?: string
  created_at: string
}

export default function UsersPage() {
  // Get authentication data
  const { user, token, isAuthenticated } = useAuth()
  const router = useRouter()

  // User management state
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<string>('') // '' = all roles
  const [page, setPage] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const PAGE_SIZE = 20

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [isAuthenticated, user, router])

  // Fetch users when page or filters change
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchUsers()
    }
  }, [page, filterRole, isAuthenticated, token])

  /**
   * Fetch users from API with pagination and filtering
   */
  const fetchUsers = async () => {
    setIsLoading(true)
    setError('')

    try {
      // Build query string with filters
      let queryString = `/api/users?page=${page}&limit=${PAGE_SIZE}`
      if (filterRole) {
        queryString += `&role=${filterRole}`
      }

      // Fetch users
      const response = await fetch(queryString, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        setUsers(data.data)
        setTotalUsers(data.total)
      } else {
        setError(data.message || 'Failed to fetch users')
      }
    } catch (err) {
      setError('Failed to load users')
      console.error('Fetch users error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Filter users based on search term
   * Searches in name and email fields
   */
  const filteredUsers = users.filter((u) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      u.name.toLowerCase().includes(searchLower) ||
      u.email.toLowerCase().includes(searchLower) ||
      (u.student_id && u.student_id.includes(searchLower))
    )
  })

  // Calculate pagination
  const totalPages = Math.ceil(totalUsers / PAGE_SIZE)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back navigation */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            User Management
          </h1>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Search and filter controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by name, email, or student ID
              </label>
              <Input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Role filter dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by role
              </label>
              <select
                value={filterRole}
                onChange={(e) => {
                  setFilterRole(e.target.value)
                  setPage(1) // Reset to first page when filtering
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All roles</option>
                <option value="admin">Admin</option>
                <option value="warden">Warden</option>
                <option value="student">Student</option>
              </select>
            </div>
          </div>

          {/* Result count */}
          <p className="text-sm text-gray-600 mt-4">
            Showing {filteredUsers.length} of {totalUsers} users
          </p>
        </div>

        {/* Users table - responsive */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Desktop table view */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Student ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Loading users...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {u.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {u.email}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          u.role === 'admin'
                            ? 'bg-red-100 text-red-800'
                            : u.role === 'warden'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {u.student_id || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile card view */}
          <div className="md:hidden divide-y divide-gray-200">
            {isLoading ? (
              <div className="p-6 text-center text-gray-500">
                Loading users...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No users found
              </div>
            ) : (
              filteredUsers.map((u) => (
                <div key={u.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{u.name}</h3>
                      <p className="text-sm text-gray-600">{u.email}</p>
                    </div>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      u.role === 'admin'
                        ? 'bg-red-100 text-red-800'
                        : u.role === 'warden'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {u.role}
                    </span>
                  </div>
                  {u.student_id && (
                    <p className="text-xs text-gray-500 mb-2">
                      Student ID: {u.student_id}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Joined: {new Date(u.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pagination controls */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Page {page} of {totalPages || 1}
          </p>
          <div className="flex gap-2">
            {/* Previous page button */}
            <Button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1 || isLoading}
              className="bg-gray-600 hover:bg-gray-700 text-white disabled:opacity-50"
            >
              ← Previous
            </Button>

            {/* Next page button */}
            <Button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages || isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              Next →
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
