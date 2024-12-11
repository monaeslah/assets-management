import { Router, Response } from 'express'
import { body, validationResult } from 'express-validator'
import authMiddleware from '../middlewares/authMiddleware'
import prisma from '../db'
import {
  CreateAssetRequest,
  UpdateAssetRequest,
  DeleteRequest,
  ReadRequest
} from '../types/requests'

const router = Router()

router.post(
  '/assets',
  authMiddleware(['HR_MANAGER']),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('type').notEmpty().withMessage('Type is required'),
    body('status')
      .optional() // Make status optional
      .isIn(['AVAILABLE', 'CHECKED_OUT'])
      .withMessage('Status must be AVAILABLE or CHECKED_OUT'),
    body('assignedUserId')
      .optional()
      .isInt()
      .withMessage('Assigned User ID must be an integer'),
    body('serialNumber')
      .notEmpty()
      .withMessage('Serial number is required')
      .custom(async value => {
        const asset = await prisma.asset.findUnique({
          where: { serialNumber: value }
        })
        if (asset) {
          throw new Error('Serial number already exists')
        }
        return true
      })
  ],
  async (req: CreateAssetRequest, res: Response): Promise<void> => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() })
      return
    }

    const { name, type, serialNumber, status, assignedUserId } = req.body

    try {
      // If `assignedUserId` is provided, validate that the user exists
      if (assignedUserId) {
        const user = await prisma.user.findUnique({
          where: { id: assignedUserId }
        })
        if (!user) {
          res.status(400).json({ message: 'Assigned user does not exist' })
          return
        }
      }

      // Use default status if not provided
      const assetStatus = status || 'AVAILABLE'

      const asset = await prisma.asset.create({
        data: { name, type, serialNumber, status: assetStatus, assignedUserId }
      })

      res.status(201).json({ asset })
    } catch (error) {
      res.status(500).json({ message: 'Error creating asset', error })
    }
  }
)

// Read Assets
router.get(
  '/assets',
  authMiddleware(['HR_MANAGER']),
  async (req: ReadRequest, res: Response): Promise<void> => {
    try {
      const assets = await prisma.asset.findMany({
        include: { assignedUser: true }
      })
      res.status(200).json({ assets })
    } catch (error) {
      res.status(500).json({ message: 'Error fetching assets', error })
    }
  }
)

// Read Single Asset
router.get(
  '/assets/:id',
  authMiddleware(['HR_MANAGER']),
  async (req: ReadRequest, res: Response): Promise<void> => {
    const { id } = req.params

    if (!id || isNaN(Number(id))) {
      res.status(400).json({ message: 'Invalid asset ID' })
      return
    }

    try {
      const asset = await prisma.asset.findUnique({
        where: { id: parseInt(id, 10) },
        include: { assignedUser: true }
      })

      if (!asset) {
        res.status(404).json({ message: 'Asset not found' })
        return
      }

      res.status(200).json({ asset })
    } catch (error) {
      res.status(500).json({ message: 'Error fetching asset', error })
    }
  }
)

// Update Asset
router.put(
  '/assets/:id',
  authMiddleware(['HR_MANAGER']),
  [
    body('name').optional().notEmpty().withMessage('Name is required'),
    body('type').optional().notEmpty().withMessage('Type is required'),
    body('status')
      .optional()
      .isIn(['AVAILABLE', 'CHECKED_OUT'])
      .withMessage('Status must be AVAILABLE or CHECKED_OUT'),
    body('assignedUserId')
      .optional()
      .isInt()
      .withMessage('Assigned User ID must be an integer')
  ],
  async (req: UpdateAssetRequest, res: Response): Promise<void> => {
    const { id } = req.params

    if (!id || isNaN(Number(id))) {
      res.status(400).json({ message: 'Invalid asset ID' })
      return
    }

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() })
      return
    }

    const { name, type, status, assignedUserId } = req.body

    try {
      const asset = await prisma.asset.findUnique({
        where: { id: parseInt(id, 10) }
      })

      if (!asset) {
        res.status(404).json({ message: 'Asset not found' })
        return
      }

      if (assignedUserId) {
        const user = await prisma.user.findUnique({
          where: { id: assignedUserId }
        })
        if (!user) {
          res.status(400).json({ message: 'Assigned user does not exist' })
          return
        }
      }

      const updatedAsset = await prisma.asset.update({
        where: { id: parseInt(id, 10) },
        data: { name, type, status, assignedUserId }
      })

      res.status(200).json({ asset: updatedAsset })
    } catch (error) {
      res.status(500).json({ message: 'Error updating asset', error })
    }
  }
)

// Delete Asset
router.delete(
  '/assets/:id',
  authMiddleware(['HR_MANAGER']),
  async (req: DeleteRequest, res: Response): Promise<void> => {
    const { id } = req.params

    if (!id || isNaN(Number(id))) {
      res.status(400).json({ message: 'Invalid asset ID' })
      return
    }

    try {
      const asset = await prisma.asset.findUnique({
        where: { id: parseInt(id, 10) }
      })

      if (!asset) {
        res.status(404).json({ message: 'Asset not found' })
        return
      }

      await prisma.asset.delete({
        where: { id: parseInt(id, 10) }
      })

      res.status(204).send()
    } catch (error) {
      res.status(500).json({ message: 'Error deleting asset', error })
    }
  }
)

export default router
