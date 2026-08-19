const express = require('express');

const Product = require('../models/product');
const User = require('../models/user')

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.post('/add', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { title, description, price, image, category, stock } = req.body;

        const newProduct = await Product.create({ title, description, price, image, category, stock });

        res.status(201).json({
            message: 'Product added successfully',
            product: newProduct
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: error.message
        });
    }
})

router.get('/all', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });

        res.status(200).json({
            products
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: error.message
        });
    }
})

router.get('/getDashboardData', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const totalUsers = await User.countDocuments();
        const Order = require('../models/Order');

        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });
        const processingOrders = await Order.countDocuments({ orderStatus: 'Processing' });
        const deliveredOrders = await Order.countDocuments({ orderStatus: 'Delivered' });
        const cancelledOrders = await Order.countDocuments({ orderStatus: 'Cancelled' });

        const revenueResult = await Order.aggregate([
            { $match: { orderStatus: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? parseFloat(revenueResult[0].total.toFixed(2)) : 0;

        res.status(200).json({
            totalProducts,
            totalUsers,
            totalOrders,
            pendingOrders,
            processingOrders,
            deliveredOrders,
            cancelledOrders,
            totalRevenue
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: err.message
        });
    }
})

router.get('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }
        res.status(200).json({
            product
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: error.message
        });
    }
})

router.put('/update/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })

        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        res.status(200).json({
            message: 'Product updated successfully',
            product
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: error.message
        });
    }
})

router.delete('/delete/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(
            req.params.id
        );

        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        res.status(200).json({
            message: 'Product deleted successfully'
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: error.message
        });
    }
})

module.exports = router