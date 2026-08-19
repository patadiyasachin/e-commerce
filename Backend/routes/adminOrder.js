const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/user');
const Product = require('../models/product');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// GET /api/admin/orders
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { search, orderStatus, paymentStatus, sortBy } = req.query;
        let query = {};

        // Search functionality
        if (search) {
            const cleanSearch = search.trim();
            // If it starts with ORD-, match orderNumber
            if (/^ORD-/i.test(cleanSearch)) {
                query.orderNumber = { $regex: cleanSearch, $options: 'i' };
            } else {
                // Find users matching name or email
                const users = await User.find({
                    $or: [
                        { name: { $regex: cleanSearch, $options: 'i' } },
                        { email: { $regex: cleanSearch, $options: 'i' } }
                    ]
                }).select('_id');
                const userIds = users.map(u => u._id);

                query.$or = [
                    { user: { $in: userIds } },
                    { orderNumber: { $regex: cleanSearch, $options: 'i' } }
                ];
            }
        }

        // Status filters
        if (orderStatus && orderStatus !== 'All') {
            query.orderStatus = orderStatus;
        }

        if (paymentStatus && paymentStatus !== 'All') {
            query.paymentStatus = paymentStatus;
        }

        // Sorting definitions
        let sortOption = { createdAt: -1 }; // default newest
        if (sortBy === 'Oldest') {
            sortOption = { createdAt: 1 };
        } else if (sortBy === 'Highest Amount') {
            sortOption = { totalAmount: -1 };
        } else if (sortBy === 'Lowest Amount') {
            sortOption = { totalAmount: 1 };
        }

        const orders = await Order.find(query)
            .populate('user', 'name email')
            .sort(sortOption);

        res.status(200).json({
            success: true,
            data: orders
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/admin/orders/:id
router.get('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid Order ID format' });
        }

        const order = await Order.findById(req.params.id).populate('user', 'name email');
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/admin/orders/:id/status
router.put('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid Order ID format' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const { orderStatus, paymentStatus } = req.body;

        // Transition restrictions:
        // Delivered or Cancelled orders cannot go back or transition to anything else
        if (order.orderStatus === 'Delivered' && orderStatus && orderStatus !== 'Delivered') {
            return res.status(400).json({
                success: false,
                message: 'A Delivered order status cannot be reverted.'
            });
        }

        if (order.orderStatus === 'Cancelled' && orderStatus && orderStatus !== 'Cancelled') {
            return res.status(400).json({
                success: false,
                message: 'A Cancelled order status cannot be reopened or changed.'
            });
        }

        if (orderStatus === 'Cancelled' && order.orderStatus === 'Delivered') {
            return res.status(400).json({
                success: false,
                message: 'Delivered orders cannot be cancelled.'
            });
        }

        // Update paymentStatus if provided
        if (paymentStatus) {
            order.paymentStatus = paymentStatus;
        }

        // If status changed to Cancelled, restore stock (exactly once)
        if (orderStatus === 'Cancelled' && order.orderStatus !== 'Cancelled') {
            for (const item of order.items) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: item.quantity }
                });
            }
            order.orderStatus = 'Cancelled';
        } else if (orderStatus) {
            order.orderStatus = orderStatus;
            // Logical progression: if Delivered, payment should automatically be Paid for COD
            if (orderStatus === 'Delivered' && order.paymentMethod === 'Cash on Delivery') {
                order.paymentStatus = 'Paid';
            }
        }

        await order.save();

        res.status(200).json({
            success: true,
            message: 'Order updated successfully',
            data: order
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
