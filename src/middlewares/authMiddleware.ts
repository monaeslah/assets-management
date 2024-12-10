import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AuthenticatedRequest, TokenPayload } from '../types/requests'

const authMiddleware = (roles: string[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      res.status(401).json({ message: 'Unauthorized: Token not provided' })
      return
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.TOKEN_SECRET!
      ) as TokenPayload

      if (!roles.includes(decoded.role)) {
        res.status(403).json({ message: 'Forbidden: Access denied' })
        return
      }

      req.user = decoded
      next()
    } catch (err) {
      res.status(401).json({ message: 'Unauthorized', err })
    }
  }
}

export default authMiddleware
