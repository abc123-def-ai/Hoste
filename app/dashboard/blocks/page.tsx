'use client'

/**
 * Block Management Page
 * 
 * Manage hostel blocks with features:
 * - View all blocks with statistics
 * - Create new blocks
 * - View room allocation per block
 * - Responsive design
 * 
 * Features:
 * - Form to create new blocks
 * - Block statistics (total rooms, available rooms)
 * - Real-time updates
 * - Mobile-friendly layout
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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

export default function BlocksPage() {
  // Get authentication data
  const { user, token, isAuthenticated } = useAuth()
  const router = useRouter()

  // Block management state
  const [blocks, setBlocks] = useState<Block[]>([])
  
  // Form state for creating new block
  const [newBlock, setNewBlock] = useState({
    name: '',
    capacity: '',
    location: '',
    warden_id: '',
  })

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [isAuthenticated, user, router])

  // Fetch blocks on component mount
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchBlocks()
    }
  }, [isAuthenticated, token])

  /**
   * Fetch all blocks from API
   */
  const fetchBlocks = async () => {
    setIsLoading(true)
    setError('')

    try {
      // Get blocks from API
      const response = await fetch('/api/blocks', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        setBlocks(data.data)
      } else {
        setError(data.message || 'Failed to fetch blocks')
      }
    } catch (err) {
      setError('Failed to load blocks')
      console.error('Fetch blocks error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Handle creating a new block
   * Validates input, sends to API, updates list
   */
  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validate form inputs
    if (!newBlock.name || !newBlock.capacity || !newBlock.location) {
      setError('Name, capacity, and location are required')
      return
    }

    // Validate capacity is a positive number
    const capacity = parseInt(newBlock.capacity)
    if (isNaN(capacity) || capacity <= 0) {
      setError('Capacity must be a positive number')
      return
    }

    setIsCreating(true)

    try {
      // Send block creation request to API
      const response = await fetch('/api/blocks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newBlock.name,
          capacity: capacity,
          location: newBlock.location,
          warden_id: newBlock.warden_id || null,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Clear form after successful creation
        setNewBlock({
          name: '',
          capacity: '',
          location: '',
          warden_id: '',
        })
        
        // Show success message
        setSuccess('Block created successfully')
        
        // Refresh blocks list
        fetchBlocks()

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.message || 'Failed to create block')
      }
    } catch (err) {
      setError('An error occurred while creating block')
      console.error('Create block error:', err)
    } finally {
      setIsCreating(false)
    }
  }

  /**
   * Calculate occupancy percentage for a block
   */
  const getOccupancyPercentage = (block: Block) => {
    if (block.room_count === 0) return 0
    const occupied = block.room_count - block.available_rooms
    return Math.round((occupied / block.room_count) * 100)
  }

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
            Block Management
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

        {/* Success message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Create new block form */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Create New Block
          </h2>

          <form onSubmit={handleCreateBlock} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Block name input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Block Name
              </label>
              <Input
                type="text"
                placeholder="e.g., Block A"
                value={newBlock.name}
                onChange={(e) => setNewBlock({ ...newBlock, name: e.target.value })}
                required
                disabled={isCreating}
                className="w-full"
              />
            </div>

            {/* Capacity input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capacity
              </label>
              <Input
                type="number"
                placeholder="e.g., 50"
                value={newBlock.capacity}
                onChange={(e) => setNewBlock({ ...newBlock, capacity: e.target.value })}
                required
                disabled={isCreating}
                className="w-full"
              />
            </div>

            {/* Location input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <Input
                type="text"
                placeholder="e.g., Campus North"
                value={newBlock.location}
                onChange={(e) => setNewBlock({ ...newBlock, location: e.target.value })}
                required
                disabled={isCreating}
                className="w-full"
              />
            </div>

            {/* Warden ID input (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Warden ID (Optional)
              </label>
              <Input
                type="text"
                placeholder="e.g., W001"
                value={newBlock.warden_id}
                onChange={(e) => setNewBlock({ ...newBlock, warden_id: e.target.value })}
                disabled={isCreating}
                className="w-full"
              />
            </div>

            {/* Submit button */}
            <div className="md:col-span-2 lg:col-span-4 flex gap-2">
              <Button
                type="submit"
                disabled={isCreating}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isCreating ? 'Creating...' : 'Create Block'}
              </Button>
            </div>
          </form>
        </div>

        {/* Blocks list */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            All Blocks ({blocks.length})
          </h2>

          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading blocks...</p>
            </div>
          ) : blocks.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow">
              <p className="text-gray-600">No blocks found. Create your first block above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blocks.map((block) => {
                const occupancy = getOccupancyPercentage(block)
                return (
                  <div
                    key={block.id}
                    className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
                  >
                    {/* Block header */}
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {block.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        📍 {block.location}
                      </p>
                    </div>

                    {/* Block stats */}
                    <div className="space-y-3 mb-4">
                      {/* Capacity stat */}
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Capacity</span>
                        <span className="font-medium text-gray-900">
                          {block.capacity} students
                        </span>
                      </div>

                      {/* Room count stat */}
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Rooms</span>
                        <span className="font-medium text-gray-900">
                          {block.room_count} total
                        </span>
                      </div>

                      {/* Occupancy stat with progress bar */}
                      <div>
                        <div className="flex justify-between items-center text-sm mb-1">
                          <span className="text-gray-600">Occupancy</span>
                          <span className="font-medium text-gray-900">
                            {occupancy}%
                          </span>
                        </div>
                        {/* Progress bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              occupancy > 80
                                ? 'bg-red-500'
                                : occupancy > 50
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${occupancy}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Available rooms stat */}
                      <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-200">
                        <span className="text-gray-600">Available Rooms</span>
                        <span className="font-medium text-green-600">
                          {block.available_rooms}
                        </span>
                      </div>
                    </div>

                    {/* Action link */}
                    <Link
                      href={`/dashboard/blocks/${block.id}`}
                      className="block w-full text-center py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-sm font-medium transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
