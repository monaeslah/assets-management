"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (roles) => {
    return (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET);
            if (!roles.includes(decoded.role)) {
                return res.status(403).json({ message: 'Forbidden' });
            }
            req.user = decoded;
            next();
        }
        catch (err) {
            res.status(401).json({ message: 'Unauthorized' });
        }
    };
};
exports.default = authMiddleware;
