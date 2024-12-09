import { Request, Response, NextFunction } from 'express'
import { Router } from 'express'
const router = Router()

router.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.json('All good in here :)')
})

export default router
