const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const adminMiddleware = require('../middleware/adminMiddleware')
const user = require('../models/user')
const router = express.Router()

router.get('/allUser', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const u = await user.find();
        res.status(200).json({
            user: u
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: error.message
        });
    }
})

module.exports = router