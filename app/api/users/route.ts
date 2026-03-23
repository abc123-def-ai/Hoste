/**
 * GET /api/users
 * 
 * Fetch all users (Admin only)
 * Returns list of all users with their details
 * 
 * Query parameters:
 * - role: Filter by role (admin, warden, student)
 * - page: Pagination page number (default: 1)
 * - limit: Items per page (default: 10, max: 100)
 * 
 * Response:
 * {
 *   success: boolean,
 *   data: Array<{ id, email, name, role, student_id, phone, created_at }>,
 *   total: number,
 *   page: number,
 *   limit: number
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@neondatabase/serverless'
import { authenticateAndAuthorize } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  // First, authenticate the user and check they have admin role
  const auth = await authenticateAndAuthorize(request, ['admin'])
  
  // If authentication failed, return the error response
  if (!auth.decoded) {
    return auth.response
  }

  try {
    // Get query parameters for filtering and pagination
    const searchParams = request.nextUrl.searchParams
    const role = searchParams.get('role') // Optional role filter
    const page = Math.max(1, parseInt(searchParams.get('page') || '1')) // Current page
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '10')) // Items per page
    const offset = (page - 1) * limit // Calculate offset for SQL LIMIT clause

    // Build WHERE clause based on filters
    let whereClause = ''
    if (role && ['admin', 'warden', 'student'].includes(role)) {
      whereClause = `WHERE role = '${role}'`
    }

    // Get total count of users (for pagination info)
    const countResult = await sql`
      SELECT COUNT(*) as count FROM users ${whereClause ? sql`WHERE role = ${role}` : sql``}
    `
    const total = countResult[0]?.count || 0

    // Fetch paginated user list
    const users = await sql`
      SELECT id, email, name, role, student_id, phone, created_at 
      FROM users 
      ${whereClause ? sql`WHERE role = ${role}` : sql``}
      ORDER BY created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `

    // Return successful response with pagination info
    return NextResponse.json(
      {
        success: true,
        data: users || [],
        total,
        page,
        limit,
      },
      { status: 200 }
    )
  } catch (error) {
    // Log error and return error response
    console.error('Fetch users error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
