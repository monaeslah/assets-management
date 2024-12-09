import { Request } from 'express'
import { ParsedQs } from 'qs'
export type Role = 'HR_MANAGER' | 'EMPLOYEE'
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number
    role: Role
  }
}
export interface RegisterUserRequest extends Request {
  body: {
    email: string
    password: string
    role: Role
  }
}
export interface TokenPayload {
  id: number
  role: Role
}
export interface LoginUserRequest extends Request {
  body: {
    email: string
    password: string
  }
}
export interface CreateEmployeeRequest extends Request {
  body: {
    name: string
    department: string
  }
}
export interface UpdateEmployeeRequest extends Request {
  body: {
    name?: string
    department?: string
  }
  params: {
    id: string
  }
}
export interface CreateAssetRequest extends Request {
  body: {
    name: string
    type: string
    serialNumber: string
    status: 'AVAILABLE' | 'CHECKED_OUT'
    assignedUserId?: number
  }
}
export interface UpdateAssetRequest extends Request {
  body: {
    name?: string
    type?: string
    status?: 'AVAILABLE' | 'CHECKED_OUT'
    assignedUserId?: number
  }
  params: {
    id: string
  }
}
export interface DeleteRequest extends Request {
  params: {
    id: string
  }
}
export interface ReadRequest extends Request {
  query: ParsedQs & {
    name?: string
    type?: string
    status?: 'AVAILABLE' | 'CHECKED_OUT'
  }
  params: {
    id?: string
  }
}
