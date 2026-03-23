'use client'

/**
 * Admin Dashboard Page
 * 
 * Main dashboard for administrators and wardens
 * Displays:
 * - Statistics overview (total users, blocks, rooms)
 * - User management table
 * - Hostel blocks overview
 * - Quick actions and navigation
 * 
 * Features:
 * - Role-based access control
 * - Responsive layout (mobile-friendly)
 * - Real-time data fetching
 * - User management interface
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Define types for API responses
interface User {
  id: string
  email: string
  name: string
  role: string
  student_id?: string
  phone?: string
  created_at: string
}

interface Block {
  id: string
  name: string
  capacity: number
  warden_id?: string
  location: string
  room_count: number
  available_rooms: number
  created_at: string
}

interface DashboardStats {
  totalUsers: number
  totalBlocks: number
  totalRooms: number
  availableRooms: number
}

export default function DashboardPage() {
  // Get authentication data
  const { user, token, isLoading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  // State for dashboard data
  const [users, setUsers] = useState<User[]>([])
  const [blocks, setBlocks] = useState<Block[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalBlocks: 0,
    totalRooms: 0,
    availableRooms: 0,
  })

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [authLoading, isAuthenticated, router])

  // Fetch dashboard data on component mount
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchDashboardData()
    }
  }, [isAuthenticated, token])

  /**
   * Fetch all dashboard data
   * Calls APIs to get users and blocks
   */
  const fetchDashboardData = async () => {
    setIsLoading(true)
    setError('')

    try {
      // Fetch users
      const usersResponse = await fetch('/api/users?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const usersData = await usersResponse.json()

      // Fetch blocks
      const blocksResponse = await fetch('/api/blocks', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const blocksData = await blocksResponse.json()

      // Check if requests were successful
      if (usersData.success) {
        setUsers(usersData.data)
      }

      if (blocksData.success) {
        setBlocks(blocksData.data)

        // Calculate statistics
        const totalRooms = blocksData.data.reduce(
          (sum: number, block: Block) => sum + (block.room_count || 0),
          0
        )
        const availableRooms = blocksData.data.reduce(
          (sum: number, block: Block) => sum + (block.available_rooms || 0),
          0
        )

        setStats({
          totalUsers: usersData.data.length,
          totalBlocks: blocksData.data.length,
          totalRooms,
          availableRooms,
        })
      }
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error('Dashboard error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Main dashboard layout
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header navigation */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Hostel Management System
            </h1>
            <p className="text-gray-600 text-sm">
              Admin Dashboard
            </p>
          </div>

          {/* User info and logout */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role}
              </p>
            </div>
            <Button
              onClick={() => {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                router.push('/auth/login')
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error message display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Statistics cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalUsers}
                </p>
              </div>
              <div className="bg-blue-100 rounded-lg p-3">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          {/* Total Blocks card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Hostel Blocks
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalBlocks}
                </p>
              </div>
              <div className="bg-green-100 rounded-lg p-3">
                <span className="text-2xl">🏢</span>
              </div>
            </div>
          </div>

          {/* Total Rooms card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Rooms</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalRooms}
                </p>
              </div>
              <div className="bg-yellow-100 rounded-lg p-3">
                <span className="text-2xl">🛏️</span>
              </div>
            </div>
          </div>

          {/* Available Rooms card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Available Rooms
                </p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {stats.availableRooms}
                </p>
              </div>
              <div className="bg-purple-100 rounded-lg p-3">
                <span className="text-2xl">✓</span>
              </div>
            </div>
          </div>
        </div>

        {/* Management sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Users management section */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Users
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.slice(0, 5).map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {u.name}
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
                          {u.email}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-gray-200">
              <Link
                href="/dashboard/users"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View all users →
              </Link>
            </div>
          </div>

          {/* Blocks management section */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Hostel Blocks
              </h2>
            </div>

            <div className="divide-y divide-gray-200">
              {isLoading ? (
                <div className="px-6 py-4 text-center text-gray-500">
                  Loading...
                </div>
              ) : blocks.length === 0 ? (
                <div className="px-6 py-4 text-center text-gray-500">
                  No blocks found
                </div>
              ) : (
                blocks.slice(0, 5).map((block) => (
                  <div key={block.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {block.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {block.location}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          Rooms: {block.available_rooms} / {block.room_count} available
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          Capacity: {block.capacity}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200">
              <Link
                href="/dashboard/blocks"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View all blocks →
              </Link>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/dashboard/users"
            className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
          >
            <h3 className="font-semibold text-blue-900">Manage Users</h3>
            <p className="text-sm text-blue-700 mt-1">Add, edit, or remove users</p>
          </Link>

          <Link
            href="/dashboard/blocks"
            className="p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
          >
            <h3 className="font-semibold text-green-900">Manage Blocks</h3>
            <p className="text-sm text-green-700 mt-1">Add or edit hostel blocks</p>
          </Link>

          <Link
            href="/dashboard/rooms"
            className="p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors"
          >
            <h3 className="font-semibold text-purple-900">Manage Rooms</h3>
            <p className="text-sm text-purple-700 mt-1">Add or edit hostel rooms</p>
          </Link>
        </div>
      </main>
    </div>
  )
}
