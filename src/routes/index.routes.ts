import { Request, Response, NextFunction } from 'express'
import { Router } from 'express'
const router = Router()
// app.use('/api/auth', authRoutes)
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.json('All good in here :)')
})

export default router
