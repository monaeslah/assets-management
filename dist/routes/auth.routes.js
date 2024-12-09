"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../db"));
const router = (0, express_1.Router)();
// Register Route
router.post('/signup', async (req, res) => {
    const { email, password, role } = req.body;
    try {
        // Check if the user already exists
        const existingUser = await db_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        // Hash the password
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Create the user
        const user = await db_1.default.user.create({
            data: {
                email,
                password: hashedPassword,
                role
            }
        });
        // Generate a token
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, process.env.TOKEN_SECRET, { expiresIn: '1h' });
        res.status(201).json({ user, token });
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating user', error });
    }
});
// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Find the user by email
        const user = await db_1.default.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Compare passwords
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, process.env.TOKEN_SECRET, { expiresIn: '1h' });
        return res.json({ token });
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal Server Error', error });
    }
});
exports.default = router;
