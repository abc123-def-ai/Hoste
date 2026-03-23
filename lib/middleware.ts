/**
 * Authentication Middleware Module
 * 
 * Provides middleware functions to protect API routes
 * Validates JWT tokens and checks user roles
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractToken } from './auth'

/**
 * Middleware to verify JWT token in request headers
 * Extracts and validates the token, returning decoded user info
 * 
 * @param request - NextRequest object
 * @returns Object with decoded token or error response
 * @example
 * const auth = await authenticateUser(request)
 * if (!auth.decoded) return auth.response
 * const userId = auth.decoded.userId
 */
export async function authenticateUser(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization')
    const token = extractToken(authHeader)

    // Check if token exists
    if (!token) {
      return {
        decoded: null,
        response: NextResponse.json(
          { success: false, message: 'No token provided' },
          { status: 401 }
        ),
      }
    }

    // Verify and decode token
    const decoded = verifyToken(token)

    // Check if token is valid and not expired
    if (!decoded) {
      return {
        decoded: null,
        response: NextResponse.json(
          { success: false, message: 'Invalid or expired token' },
          { status: 401 }
        ),
      }
    }

    // Return decoded token with null response (success case)
    return {
      decoded,
      response: null,
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return {
      decoded: null,
      response: NextResponse.json(
        { success: false, message: 'Authentication failed' },
        { status: 500 }
      ),
    }
  }
}

/**
 * Middleware to check if user has required role(s)
 * 
 * @param userRole - The user's current role
 * @param allowedRoles - Array of roles that are allowed
 * @returns Boolean indicating if user has required role
 * @example
 * if (!checkRole(user.role, ['admin', 'warden'])) {
 *   return unauthorized response
 * }
 */
export function checkRole(
  userRole: string,
  allowedRoles: string[]
): boolean {
  return allowedRoles.includes(userRole)
}

/**
 * Combined middleware to authenticate and check role
 * 
 * @param request - NextRequest object
 * @param requiredRoles - Array of allowed roles
 * @returns Object with decoded token or error response
 * @example
 * const auth = await authenticateAndAuthorize(request, ['admin'])
 * if (!auth.decoded) return auth.response
 */
export async function authenticateAndAuthorize(
  request: NextRequest,
  requiredRoles: string[]
) {
  // First verify authentication
  const auth = await authenticateUser(request)
  if (!auth.decoded) {
    return auth
  }

  // Check if user has required role
  if (!checkRole(auth.decoded.userRole, requiredRoles)) {
    return {
      decoded: null,
      response: NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      ),
    }
  }

  // User is authenticated and authorized
  return auth
}
