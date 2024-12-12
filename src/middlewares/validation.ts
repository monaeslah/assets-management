import { body } from 'express-validator'
import prisma from '../db'
export const AssetValidationRules = {
  create: [
    body('name').notEmpty().withMessage('Name is required'),
    body('type').notEmpty().withMessage('Type is required'),
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
      }),
    body('status')
      .optional()
      .isIn(['AVAILABLE', 'CHECKED_OUT'])
      .withMessage('Status must be AVAILABLE or CHECKED_OUT'),
    body('assignedUserId')
      .optional()
      .isInt()
      .withMessage('Assigned User ID must be an integer')
      .custom(async value => {
        const user = await prisma.user.findUnique({ where: { id: value } })
        if (!user) {
          throw new Error('Assigned user does not exist')
        }
        return true
      })
  ],
  update: [
    body('name').optional().notEmpty().withMessage('Name must not be empty'),
    body('type').optional().notEmpty().withMessage('Type must not be empty'),
    body('status')
      .optional()
      .isIn(['AVAILABLE', 'CHECKED_OUT'])
      .withMessage('Status must be AVAILABLE or CHECKED_OUT'),
    body('assignedUserId')
      .optional()
      .isInt()
      .withMessage('Assigned User ID must be an integer')
      .custom(async value => {
        const user = await prisma.user.findUnique({ where: { id: value } })
        if (!user) {
          throw new Error('Assigned user does not exist')
        }
        return true
      })
  ]
}
console.log(typeof AssetValidationRules.create) // Should output "object"
console.log(Array.isArray(AssetValidationRules.create)) // Should output true
