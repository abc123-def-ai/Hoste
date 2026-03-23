/**
 * GET /api/blocks
 * POST /api/blocks (Admin only)
 * 
 * GET: Fetch all hostel blocks
 * - Response includes block details and room counts
 * 
 * POST: Create a new hostel block (Admin only)
 * - Request body: { name, capacity, warden_id, location }
 * - Response: Created block details
 */

import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@neondatabase/serverless'
import { authenticateAndAuthorize } from '@/lib/middleware'

/**
 * GET /api/blocks
 * Fetch all hostel blocks
 */
export async function GET(request: NextRequest) {
  try {
    // Fetch all blocks with room count information
    const blocks = await sql`
      SELECT 
        b.id,
        b.name,
        b.capacity,
        b.warden_id,
        b.location,
        b.created_at,
        COUNT(r.id) as room_count,
        SUM(CASE WHEN r.is_available = true THEN 1 ELSE 0 END) as available_rooms
      FROM blocks b
      LEFT JOIN rooms r ON b.id = r.block_id
      GROUP BY b.id
      ORDER BY b.created_at DESC
    `

    // Return blocks data
    return NextResponse.json(
      {
        success: true,
        data: blocks || [],
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Fetch blocks error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch blocks' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/blocks
 * Create a new hostel block (Admin only)
 */
export async function POST(request: NextRequest) {
  // Authenticate and check admin role
  const auth = await authenticateAndAuthorize(request, ['admin'])
  
  if (!auth.decoded) {
    return auth.response
  }

  try {
    // Parse request body
    const { name, capacity, warden_id, location } = await request.json()

    // Validate required fields
    if (!name || !capacity || !location) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Name, capacity, and location are required' 
        },
        { status: 400 }
      )
    }

    // Validate capacity is a positive number
    if (typeof capacity !== 'number' || capacity <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Capacity must be a positive number' 
        },
        { status: 400 }
      )
    }

    // Insert new block into database
    const result = await sql`
      INSERT INTO blocks (name, capacity, warden_id, location, created_at)
      VALUES (${name}, ${capacity}, ${warden_id || null}, ${location}, NOW())
      RETURNING id, name, capacity, warden_id, location, created_at
    `

    // Check if block was created
    if (!result || result.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to create block' 
        },
        { status: 500 }
      )
    }

    // Return created block
    return NextResponse.json(
      {
        success: true,
        message: 'Block created successfully',
        data: result[0],
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create block error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create block' },
      { status: 500 }
    )
  }
}
