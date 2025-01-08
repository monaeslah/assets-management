import { Router, Response, Request } from 'express'
import {
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  DeleteRequest,
  ReadRequest
} from '../types/requests'
import prisma from '../db'
import authMiddleware from '../middlewares/authMiddleware'
import { body, param, validationResult } from 'express-validator'
const router = Router()
const rolesSuper = ['HR_MANAGER', 'SUPER_ADMIN']
router.get(
  '/employee/departments',
  authMiddleware(['HR_MANAGER']),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const departments = await prisma.department.findMany()
      res.status(200).json({ departments })
    } catch (error) {
      res.status(500).json({ message: 'Error fetching departments', error })
    }
  }
)

router.get(
  '/employee/:id',
  authMiddleware(['HR_MANAGER']),
  param('id').isInt().withMessage('Employee ID must be an integer'),
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() })
      return
    }
    const { id } = req.params

    try {
      const employee = await prisma.user.findUnique({
        where: { id: parseInt(id, 10) },
        include: { department: true }
      })

      if (!employee) {
        res.status(404).json({ message: 'Employee not found' })
        return
      }

      res.status(200).json({
        status: 'success',
        message: 'Employee retrieved successfully',
        data: { employee }
      })
    } catch (error) {
      res.status(500).json({ message: 'Error fetching employee', error })
    }
  }
)
router.get(
  '/employee',
  // authMiddleware(['HR_MANAGER']),÷
  authMiddleware(rolesSuper),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const employees = await prisma.user.findMany({
        include: { department: true }
      })

      res.status(200).json({ employees })
    } catch (error) {
      if (!res.headersSent) {
        // Only sends a response if headers were not already sent
        res.status(500).json({ message: 'Error fetching employees', error })
      } else {
        res.status(500).json({ message: 'Error fetching employees', error })
      }
    }
  }
)
router.put(
  '/employee/:id',
  authMiddleware(['HR_MANAGER']),
  [
    body('departmentId')
      .optional()
      .isInt()
      .withMessage('Department ID must be an integer'),
    body('role').optional().isString().withMessage('Role must be a string'),
    body('name').optional().isString().withMessage('Name must be a string')
  ],
  async (req: UpdateEmployeeRequest, res: Response): Promise<void> => {
    const { id } = req.params
    const { name, departmentId, role } = req.body

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() })
      return
    }

    try {
      const updateData: { [key: string]: any } = {}
      if (name !== undefined) updateData.name = name
      if (departmentId !== undefined) updateData.departmentId = departmentId
      if (role !== undefined) {
        if (
          req.body.role === 'HR_MANAGER' &&
          ['HR_MANAGER', 'SUPER_ADMIN'].includes(role)
        ) {
          res
            .status(403)
            .json({ message: 'Forbidden: Cannot assign restricted roles.' })
          return
        }
        updateData.role = role
      }
      console.log(updateData)
      const updatedEmployee = await prisma.user.update({
        where: { id: parseInt(id, 10) },
        data: updateData
      })

      res.status(200).json({ employee: updatedEmployee })
    } catch (error) {
      res.status(500).json({ message: 'Error updating employee', error })
    }
  }
)

router.delete(
  '/employee/:id',
  authMiddleware(['HR_MANAGER']),
  param('id').isInt().withMessage('Employee ID must be an integer'),
  async (req: DeleteRequest, res: Response): Promise<void> => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() })
      return
    }
    const { id } = req.params

    try {
      const employee = await prisma.user.findUnique({
        where: { id: parseInt(id, 10) }
      })

      if (!employee) {
        res.status(404).json({ message: 'Employee not found' })
        return
      }

      await prisma.asset.updateMany({
        where: { assignedUserId: parseInt(id, 10) },
        data: { assignedUserId: null }
      })

      await prisma.user.delete({
        where: { id: parseInt(id, 10) }
      })

      res.status(204).json({
        status: 'success',
        message: 'Employee deleted successfully'
      })
    } catch (error) {
      res.status(500).json({ message: 'Error deleting employee', error })
    }
  }
)

export default router
