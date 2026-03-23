-- ============================================================================
-- STUDENT HOSTEL MANAGEMENT SYSTEM - DATABASE SCHEMA
-- ============================================================================
-- This script creates all necessary tables for the hostel management system
-- Tables created:
-- 1. users - All system users (admin, warden, students)
-- 2. blocks - Hostel blocks/buildings
-- 3. rooms - Individual rooms within blocks
-- 4. students - Student information with room assignments
-- 5. payments - Payment records for hostel fees
-- 6. maintenance - Maintenance requests and tracking
-- 7. visitor_logs - Log of visitor check-ins/check-outs
-- ============================================================================

-- ============================================================================
-- 1. USERS TABLE
-- ============================================================================
-- Stores all user accounts: Admin, Wardens, and Students
-- Fields:
--   - id: Unique identifier
--   - email: User email (must be unique)
--   - password_hash: Bcrypt hashed password for security
--   - full_name: User's full name
--   - role: User type (admin, warden, student)
--   - phone: Contact phone number
--   - created_at: Account creation timestamp
--   - updated_at: Last update timestamp
-- ============================================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'warden', 'student')),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups during login
CREATE INDEX idx_users_email ON users(email);
-- Create index on role for quick filtering by user type
CREATE INDEX idx_users_role ON users(role);


-- ============================================================================
-- 2. BLOCKS TABLE
-- ============================================================================
-- Represents hostel blocks/buildings
-- Fields:
--   - id: Unique identifier
--   - block_name: Name of the block (e.g., "Block A", "Block B")
--   - warden_id: ID of the warden responsible for this block
--   - total_rooms: Total number of rooms in this block
--   - floor_count: Number of floors in this block
--   - capacity_per_room: Standard capacity (number of students) per room
--   - description: Additional details about the block
--   - created_at: When this block record was created
-- ============================================================================
CREATE TABLE blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_name VARCHAR(100) NOT NULL,
  warden_id UUID NOT NULL,
  total_rooms INTEGER NOT NULL,
  floor_count INTEGER NOT NULL,
  capacity_per_room INTEGER DEFAULT 2,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (warden_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create index on block_name for quick search
CREATE INDEX idx_blocks_block_name ON blocks(block_name);
-- Create index on warden_id to find all blocks managed by a warden
CREATE INDEX idx_blocks_warden_id ON blocks(warden_id);


-- ============================================================================
-- 3. ROOMS TABLE
-- ============================================================================
-- Individual rooms within blocks
-- Fields:
--   - id: Unique identifier
--   - block_id: ID of the block this room belongs to
--   - room_number: Room number (e.g., "101", "201")
--   - floor: Floor number
--   - capacity: How many students can live in this room
--   - current_occupancy: Current number of students in the room
--   - status: Room status (empty, occupied, maintenance, reserved)
--   - features: JSON field storing amenities (fan, AC, WiFi, etc.)
--   - created_at: When room was added to system
-- ============================================================================
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id UUID NOT NULL,
  room_number VARCHAR(20) NOT NULL,
  floor INTEGER NOT NULL,
  capacity INTEGER NOT NULL,
  current_occupancy INTEGER DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'empty' CHECK (status IN ('empty', 'occupied', 'maintenance', 'reserved')),
  features JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (block_id) REFERENCES blocks(id) ON DELETE CASCADE
);

-- Create index on block_id to find all rooms in a block
CREATE INDEX idx_rooms_block_id ON rooms(block_id);
-- Create index on status to quickly find available/occupied rooms
CREATE INDEX idx_rooms_status ON rooms(status);
-- Create index on room_number + block_id for unique room identification
CREATE INDEX idx_rooms_number_block ON rooms(block_id, room_number);


-- ============================================================================
-- 4. STUDENTS TABLE
-- ============================================================================
-- Student information and hostel assignment
-- Fields:
--   - id: Unique identifier
--   - user_id: Link to user account
--   - enrollment_number: Student's college enrollment number (unique)
--   - major: Area of study
--   - room_id: Current assigned room
--   - check_in_date: When student moved into the hostel
--   - check_out_date: When student will leave (null if still active)
--   - status: active, graduated, left, suspended
--   - emergency_contact: Parent/guardian contact number
--   - parent_name: Parent or guardian name
--   - created_at: Record creation date
-- ============================================================================
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  enrollment_number VARCHAR(50) UNIQUE NOT NULL,
  major VARCHAR(100),
  room_id UUID,
  check_in_date DATE,
  check_out_date DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'graduated', 'left', 'suspended')),
  emergency_contact VARCHAR(20),
  parent_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL
);

-- Create index on enrollment_number for quick lookup
CREATE INDEX idx_students_enrollment ON students(enrollment_number);
-- Create index on room_id to find all students in a room
CREATE INDEX idx_students_room_id ON students(room_id);
-- Create index on status to filter active students
CREATE INDEX idx_students_status ON students(status);


-- ============================================================================
-- 5. PAYMENTS TABLE
-- ============================================================================
-- Track all hostel fee payments
-- Fields:
--   - id: Unique identifier
--   - student_id: ID of student making payment
--   - amount: Payment amount in rupees/currency
--   - payment_date: When payment was made
--   - payment_method: How it was paid (cash, card, online)
--   - transaction_id: Reference number from payment gateway
--   - due_date: Original due date for this payment
--   - months_paid_for: How many months this payment covers
--   - status: pending, completed, failed, refunded
--   - notes: Additional notes about the payment
--   - created_at: Record creation timestamp
-- ============================================================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date TIMESTAMP NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  transaction_id VARCHAR(100),
  due_date DATE,
  months_paid_for INTEGER DEFAULT 1,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Create index on student_id to view all payments by a student
CREATE INDEX idx_payments_student_id ON payments(student_id);
-- Create index on payment_date to generate reports
CREATE INDEX idx_payments_date ON payments(payment_date);
-- Create index on status to find pending/failed payments
CREATE INDEX idx_payments_status ON payments(status);


-- 6. MAINTENANCE TABLE
-- Track maintenance requests and repairs in the hostel
-- Fields:
--   - id: Unique identifier
--   - room_id: Room that needs maintenance
--   - reported_by: User ID who reported the issue
--   - issue_description: What needs to be fixed
--   - priority: low, medium, high, urgent
--   - status: open, in_progress, completed, cancelled
--   - assigned_to: Who is assigned to fix it
--   - estimated_completion: Expected completion date
--   - actual_completion: When it was actually completed
--   - cost: How much the repair cost
--   - created_at: When issue was reported
--   - updated_at: Last update to this record
-- ============================================================================
CREATE TABLE maintenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID,
  reported_by UUID NOT NULL,
  issue_description TEXT NOT NULL,
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status VARCHAR(50) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  assigned_to UUID,
  estimated_completion DATE,
  actual_completion DATE,
  cost DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
  -- FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE RESTRICT,
  -- FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
)


-- Create index on room_id to find maintenance issues in a room
CREATE INDEX idx_maintenance_room_id ON maintenance(room_id);
-- Create index on status to find open/pending issues
CREATE INDEX idx_maintenance_status ON maintenance(status);
-- Create index on priority for urgent issue tracking
CREATE INDEX idx_maintenance_priority ON maintenance(priority);
-- Create index on assigned_to to see workload by staff
CREATE INDEX idx_maintenance_assigned ON maintenance(assigned_to);


-- ============================================================================
-- 7. VISITOR_LOGS TABLE
-- ============================================================================
-- Log all visitors entering and leaving the hostel
-- Fields:
--   - id: Unique identifier
--   - student_id: Student who is hosting the visitor
--   - visitor_name: Name of the visitor
--   - visitor_phone: Visitor's contact number
--   - check_in_time: When visitor entered
--   - check_out_time: When visitor left (null if still inside)
--   - purpose: Why they're visiting (meeting, supplies, etc.)
--   - id_proof_type: Type of ID shown (Aadhaar, PAN, Passport, etc.)
--   - id_proof_number: ID number for verification
--   - notes: Any additional information
--   - created_at: Record creation timestamp
-- ============================================================================
CREATE TABLE visitor_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  visitor_name VARCHAR(255) NOT NULL,
  visitor_phone VARCHAR(20),
  check_in_time TIMESTAMP NOT NULL,
  check_out_time TIMESTAMP,
  purpose VARCHAR(255),
  id_proof_type VARCHAR(50),
  id_proof_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Create index on student_id to see all visitors of a student
CREATE INDEX idx_visitor_logs_student_id ON visitor_logs(student_id);
-- Create index on check_in_time for daily reports
CREATE INDEX idx_visitor_logs_checkin ON visitor_logs(check_in_time);
-- Create index on check_out_time to find current visitors (check_out_time IS NULL)
CREATE INDEX idx_visitor_logs_checkout ON visitor_logs(check_out_time);
