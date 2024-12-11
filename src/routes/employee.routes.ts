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
router.get(
  '/departments',
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
router.post(
  '/employee',
  authMiddleware(['HR_MANAGER']),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('departmentId').notEmpty().withMessage('Department is required')
  ],
  async (req: CreateEmployeeRequest, res: Response): Promise<void> => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() })
      return
    }

    const { name, departmentId } = req.body

    try {
      const department = await prisma.department.findUnique({
        where: { id: departmentId }
      })
      if (!department) {
        res.status(404).json({ message: 'Department not found' })
        return
      }
      const employee = await prisma.employee.create({
        data: { name, departmentId }
      })
      res.status(201).json({ employee })
    } catch (error) {
      res.status(500).json({ message: 'Error creating employee', error })
    }
  }
)

router.get(
  '/employee',
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

router.get(
  '/employee/:id',
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

router.put(
  '/employee/:id',
  authMiddleware(['HR_MANAGER']),
  async (req: UpdateEmployeeRequest, res: Response): Promise<void> => {
    const { id } = req.params
    const { name, departmentId } = req.body

    try {
      // Validate the department exists
      if (departmentId) {
        const department = await prisma.department.findUnique({
          where: { id: departmentId }
        })

        if (!department) {
          res.status(404).json({ message: 'Department not found' })
          return
        }
      }

      const updatedEmployee = await prisma.employee.update({
        where: { id: parseInt(id, 10) },
        data: { name, departmentId }
      })

      res.status(200).json({ employee: updatedEmployee })
    } catch (error) {
      res.status(500).json({ message: 'Error updating employee', error })
    }
  }
)

// Delete Employee
router.delete(
  '/employee/:id',
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
