/**
 * POST /api/auth/login
 * 
 * User login endpoint
 * Authenticates user and returns JWT token
 * 
 * Request body:
 * {
 *   email: string,
 *   password: string
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   token?: string (JWT token if login successful),
 *   user?: { id, email, name, role }
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@neondatabase/serverless'
import { verifyPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Parse email and password from request
    const { email, password } = await request.json()

    // Validate both email and password are provided
    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Email and password are required' 
        },
        { status: 400 }
      )
    }

    // Query database to find user by email
    const result = await sql`
      SELECT id, email, name, role, password 
      FROM users 
      WHERE email = ${email}
    `

    // Check if user exists
    if (!result || result.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid email or password' 
        },
        { status: 401 }
      )
    }

    // Get user record
    const user = result[0]

    // Verify the password matches the stored hash
    const isPasswordValid = await verifyPassword(password, user.password)

    // Check if password is correct
    if (!isPasswordValid) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid email or password' 
        },
        { status: 401 }
      )
    }

    // Generate JWT token for the authenticated user
    const token = generateToken(user.id, user.role)

    // Return success with token and user info (without password hash)
    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    // Log error and return generic error to client
    console.error('Login error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred during login' 
      },
      { status: 500 }
    )
  }
}
