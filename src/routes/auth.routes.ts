import { Router, Response } from 'express'
import { RegisterUserRequest, LoginUserRequest } from '../types/requests'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../db'
import { body, validationResult } from 'express-validator'

const router = Router()

// Register Route
router.post(
  '/signup',
  [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
  ],
  async (req: RegisterUserRequest, res: Response): Promise<void> => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() })
      return // Explicitly return
    }

    const { email, password } = req.body

    try {
      const existingUser = await prisma.user.findUnique({ where: { email } })
      if (existingUser) {
        res.status(400).json({ message: 'Email already exists' })
        return // Explicitly return
      }

      const hashedPassword = await bcrypt.hash(password, 10)

      // Set default role to 'USER'
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'EMPLOYEE' // Default role
        }
      })

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.TOKEN_SECRET!,
        { expiresIn: '1h' }
      )

      res.status(201).json({ user, token })
    } catch (error) {
      res.status(500).json({ message: 'Error creating user', error })
    }
  }
)

// Login Route
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req: LoginUserRequest, res: Response): Promise<void> => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() })
      return // Explicitly return
    }

    const { email, password } = req.body

    try {
      const user = await prisma.user.findUnique({ where: { email } })
      if (!user) {
        res.status(404).json({ message: 'User not found' })
        return // Explicitly return
      }

      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) {
        res.status(401).json({ message: 'Invalid credentials' })
        return // Explicitly return
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.TOKEN_SECRET!,
        { expiresIn: '1h' }
      )

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      })
    } catch (error) {
      console.error('Error:', error)
      res.status(500).json({ message: 'Internal Server Error', error })
    }
  }
)

export default router
