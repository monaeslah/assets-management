import { Request, Response } from 'express'
import prisma from '../db'
import express from 'express'

import authMiddleware from '../middlewares/authMiddleware'
export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const totalAssets = await prisma.asset.count()

    const totalEmployees = await prisma.employee.count()

    const availableAssets = await prisma.asset.count({
      where: { status: 'AVAILABLE' }
    })

    const totalAdmins = await prisma.user.count({
      where: { role: 'HR_MANAGER' }
    })

    res.json({
      totalAssets,
      totalEmployees,
      availableAssets,
      totalAdmins
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    res.status(500).json({ message: 'Error fetching dashboard data' })
  }
}

const router = express.Router()

router.get('/', authMiddleware(['HR_MANAGER']), getDashboardData)

export default router
