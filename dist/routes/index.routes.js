"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// app.use('/api/auth', authRoutes)
router.get('/', (req, res, next) => {
    res.json('All good in here :)');
});
exports.default = router;
