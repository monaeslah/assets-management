import { Router, Response, Request } from 'express'
import {
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  DeleteRequest,
  ReadRequest
} from '../types/requests'
import prisma from '../db'
import authMiddleware from '../middlewares/authMiddleware'
import { body, validationResult } from 'express-validator'
const router = Router()

router.post(
  '/',
  authMiddleware(['HR_MANAGER']),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('department').notEmpty().withMessage('Department is required')
  ],
  async (req: CreateEmployeeRequest, res: Response): Promise<void> => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() })
      return
    }

    const { name, department } = req.body

    try {
      const employee = await prisma.employee.create({
        data: { name, department }
      })

      res.status(201).json({ employee })
    } catch (error) {
      res.status(500).json({ message: 'Error creating employee', error })
    }
  }
)

// Read Employees
router.get(
  '/',
  authMiddleware(['HR_MANAGER']),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const employees = await prisma.employee.findMany()
      const hrManagers = await prisma.user.findMany({
        where: { role: 'HR_MANAGER' },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true
        }
      })
      res.status(200).json({ employees, hrManagers })
    } catch (error) {
      res.status(500).json({ message: 'Error fetching employees', error })
    }
  }
)

// Read Single Employee
router.get(
  '/:id',
  authMiddleware(['HR_MANAGER']),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params

    try {
      const employee = await prisma.employee.findUnique({
        where: { id: parseInt(id, 10) },
        include: { assetHistory: true }
      })

      if (!employee) {
        res.status(404).json({ message: 'Employee not found' })
        return
      }

      res.status(200).json({ employee })
    } catch (error) {
      res.status(500).json({ message: 'Error fetching employee', error })
    }
  }
)

// Update Employee
router.put(
  '/:id',
  authMiddleware(['HR_MANAGER']),
  async (req: UpdateEmployeeRequest, res: Response): Promise<void> => {
    const { id } = req.params
    const { name, department } = req.body

    try {
      const updatedEmployee = await prisma.employee.update({
        where: { id: parseInt(id, 10) },
        data: { name, department }
      })

      res.status(200).json({ employee: updatedEmployee })
    } catch (error) {
      res.status(500).json({ message: 'Error updating employee', error })
    }
  }
)

// Delete Employee
router.delete(
  '/:id',
  authMiddleware(['HR_MANAGER']),
  async (req: DeleteRequest, res: Response): Promise<void> => {
    const { id } = req.params

    try {
      const employee = await prisma.employee.findUnique({
        where: { id: parseInt(id, 10) }
      })

      if (!employee) {
        res.status(404).json({ message: 'Employee not found' })
        return
      }

      // Ensure all assets assigned to the employee are cleared
      await prisma.asset.updateMany({
        where: { assignedUserId: parseInt(id, 10) },
        data: { assignedUserId: null }
      })

      await prisma.employee.delete({
        where: { id: parseInt(id, 10) }
      })

      res.status(204).send()
    } catch (error) {
      res.status(500).json({ message: 'Error deleting employee', error })
    }
  }
)
export default router
