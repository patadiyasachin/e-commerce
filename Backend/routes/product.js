const express = require('express')
const router = express.Router()
const product = require('../models/product')
const authMiddleware = require('../middleware/authMiddleware')

router.get('/getAllProduct', authMiddleware, async (req, res) => {
    try {
        const pro = await product.find()
        res.status(201).json({
            message: "success!",
            product: pro
        })
    } catch (err) {
        console.log(err);
        res.status(500).json(
            { message: error.message, }
        )
    }
})

router.get('/getProductById/:id', async (req, res) => {
    try {
        const productByID = await product.findById(req.params.id);

        res.status(200).json(productByID);

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: error.message,
        });
    }
});

module.exports = router