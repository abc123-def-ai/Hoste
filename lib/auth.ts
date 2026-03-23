/**
 * Authentication Utilities Module
 * 
 * This module provides core authentication functions including:
 * - Password hashing and verification using bcrypt
 * - JWT token generation and validation
 * - User session management
 * 
 * Security Note: All passwords are hashed with bcrypt before storing in the database.
 * Tokens expire after 24 hours for security.
 */

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Get JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRY = '24h' // Token expires after 24 hours

/**
 * Hash a plain text password using bcrypt
 * 
 * @param password - The plain text password to hash
 * @returns The hashed password safe to store in database
 * @example
 * const hashedPassword = await hashPassword('user123')
 */
export async function hashPassword(password: string): Promise<string> {
  // Generate salt with 10 rounds of hashing for security
  const salt = await bcrypt.genSalt(10)
  // Hash the password with the generated salt
  return bcrypt.hash(password, salt)
}

/**
 * Verify a plain text password against a hashed password
 * 
 * @param password - The plain text password to verify
 * @param hashedPassword - The hashed password from database
 * @returns Boolean indicating if password is correct
 * @example
 * const isValid = await verifyPassword('user123', hashedPasswordFromDB)
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  // Use bcrypt to compare password with hash
  return bcrypt.compare(password, hashedPassword)
}

/**
 * Generate a JWT token for authenticated user
 * 
 * @param userId - The user's ID
 * @param userRole - The user's role (admin, warden, or student)
 * @returns Signed JWT token
 * @example
 * const token = generateToken('user-123', 'admin')
 */
export function generateToken(userId: string, userRole: string): string {
  // Create payload with user info
  const payload = {
    userId,
    userRole,
    iat: Math.floor(Date.now() / 1000), // issued at time
  }
  
  // Sign the payload with JWT secret and 24-hour expiry
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY })
}

/**
 * Verify and decode a JWT token
 * 
 * @param token - The JWT token to verify
 * @returns Decoded token payload or null if invalid
 * @example
 * const decoded = verifyToken(tokenString)
 * if (decoded) {
 *   console.log(decoded.userId)
 * }
 */
export function verifyToken(token: string): any {
  try {
    // Verify token signature and expiry
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    // Return null if token is invalid or expired
    console.error('Token verification failed:', error)
    return null
  }
}

/**
 * Extract token from authorization header
 * Expected format: "Bearer <token>"
 * 
 * @param authHeader - The Authorization header value
 * @returns The token or null if header is invalid
 * @example
 * const token = extractToken('Bearer eyJhbGci...')
 */
export function extractToken(authHeader?: string): string | null {
  if (!authHeader) return null
  
  // Split "Bearer token" and extract the actual token
  const parts = authHeader.split(' ')
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1]
  }
  
  return null
}
