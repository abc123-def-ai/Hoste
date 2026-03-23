/**
 * Database Connection Module
 * 
 * This module handles all database connections to Neon PostgreSQL.
 * It provides a reusable connection pool for efficient query execution.
 * 
 * Environment Variables Required:
 * - DATABASE_URL: Connection string for Neon PostgreSQL
 */

import { sql } from '@neondatabase/serverless'

/**
 * Get database connection pool
 * Uses Neon's serverless PostgreSQL for scalable database operations
 * 
 * @returns SQL query function ready to execute
 * @example
 * const db = getPool()
 * const result = await db`SELECT * FROM users WHERE id = ${userId}`
 */
export function getPool() {
  // Return the sql query function that handles connection pooling
  return sql
}

/**
 * Helper function to safely execute database queries
 * Catches and logs errors without exposing sensitive info to client
 * 
 * @param query - The database query to execute
 * @returns The query result or null on error
 * @example
 * const user = await safeQuery(
 *   sql`SELECT * FROM users WHERE id = ${userId}`
 * )
 */
export async function safeQuery(query: any) {
  try {
    return await query
  } catch (error) {
    console.error('Database query error:', error)
    return null
  }
}

// Export the sql function for use throughout the application
export { sql }
