/**
 * POST /api/auth/signup
 * 
 * User registration endpoint
 * 
 * Request body:
 * {
 *   email: string,
 *   password: string,
 *   name: string,
 *   role: 'student' | 'warden' | 'admin',
 *   studentId?: string (required if role is 'student'),
 *   phone?: string
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   token?: string (JWT token if successful),
 *   user?: { id, email, name, role }
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@neondatabase/serverless'
import { hashPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming request body
    const { email, password, name, role, studentId, phone } = await request.json()

    // Validate all required fields are provided
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Email, password, name, and role are required' 
        },
        { status: 400 }
      )
    }

    // Validate role is one of the allowed values
    if (!['student', 'warden', 'admin'].includes(role)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid role. Must be student, warden, or admin' 
        },
        { status: 400 }
      )
    }

    // Validate studentId is provided if registering as student
    if (role === 'student' && !studentId) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Student ID is required for student registration' 
        },
        { status: 400 }
      )
    }

    // Hash the password securely before storing
    const hashedPassword = await hashPassword(password)

    // Insert new user into database
    const result = await sql`
      INSERT INTO users (email, password, name, role, student_id, phone, created_at)
      VALUES (${email}, ${hashedPassword}, ${name}, ${role}, ${studentId || null}, ${phone || null}, NOW())
      RETURNING id, email, name, role
    `

    // Check if user was created successfully
    if (!result || result.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to create user' 
        },
        { status: 500 }
      )
    }

    // Get the newly created user
    const user = result[0]

    // Generate JWT token for immediate login
    const token = generateToken(user.id, user.role)

    // Return success with token and user data
    return NextResponse.json(
      {
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    // Handle database errors (duplicate email, constraint violations, etc)
    if (error.code === '23505') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Email already registered' 
        },
        { status: 409 }
      )
    }

    // Log error and return generic error message to client
    console.error('Signup error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred during registration' 
      },
      { status: 500 }
    )
  }
}
