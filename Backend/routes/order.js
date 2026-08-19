const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/product');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/order/create
router.post('/create', authMiddleware, async (req, res) => {
    const session = null; // Transactions omitted unless Mongo replica set is present. Safe fallback below:
    try {
        const { shippingAddress, paymentMethod } = req.body;
        const userId = req.user.id;

        // Validation of request body
        if (!shippingAddress) {
            return res.status(400).json({ success: false, message: 'Shipping address is required' });
        }
        const { fullName, phone, address, city, state, pincode } = shippingAddress;
        if (!fullName || !phone || !address || !city || !state || !pincode) {
            return res.status(400).json({ success: false, message: 'All shipping address fields are required' });
        }
        if (!paymentMethod) {
            return res.status(400).json({ success: false, message: 'Payment method is required' });
        }

        // Fetch User's Cart
        const cart = await Cart.findOne({ user: userId }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: 'Your cart is empty' });
        }

        const orderItems = [];
        let subtotal = 0;

        // Calculate and verify products, stock, prices from DB
        for (const item of cart.items) {
            const product = item.product;
            if (!product) {
                return res.status(400).json({ success: false, message: 'Product not found in cart' });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.title}`
                });
            }

            const itemSubtotal = product.price * item.quantity;
            subtotal += itemSubtotal;

            orderItems.push({
                product: product._id,
                title: product.title,
                image: product.image,
                price: product.price,
                quantity: item.quantity,
                subtotal: itemSubtotal
            });
        }

        // Calculations (Tax is 18% GST, Shipping is 0 if subtotal > 1000 else 99)
        const shippingCharge = subtotal > 1000 ? 0 : 99;
        const tax = parseFloat((subtotal * 0.18).toFixed(2));
        const discount = 0;
        const totalAmount = parseFloat((subtotal + shippingCharge + tax - discount).toFixed(2));

        // Deduct stock safely with rollback option (prevents race conditions)
        const decrementedItems = [];
        try {
            for (const item of orderItems) {
                const updatedProduct = await Product.findOneAndUpdate(
                    { _id: item.product, stock: { $gte: item.quantity } },
                    { $inc: { stock: -item.quantity } },
                    { returnDocument: 'after' }
                );

                if (!updatedProduct) {
                    throw new Error(`Insufficient stock for ${item.title}`);
                }
                decrementedItems.push({ product: item.product, quantity: item.quantity });
            }
        } catch (stockError) {
            // Rollback stock decrements if one fails
            for (const rolledBack of decrementedItems) {
                await Product.findByIdAndUpdate(rolledBack.product, {
                    $inc: { stock: rolledBack.quantity }
                });
            }
            return res.status(400).json({ success: false, message: stockError.message });
        }

        // Create the Order
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);

        const orderNumber = `ORD-${Date.now()}-${randomSuffix}`;

        const newOrder = await Order.create({
            user: userId,

            orderNumber: orderNumber,

            items: orderItems,

            shippingAddress,

            subtotal,

            shippingCharge,

            tax,

            discount,

            totalAmount,

            paymentMethod,

            paymentStatus:
                paymentMethod === 'Cash on Delivery'
                    ? 'Pending'
                    : 'Paid',

            orderStatus: 'Pending'
        });

        // Clear user's cart
        cart.items = [];
        await cart.save();

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: newOrder
        });

    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/order/my-orders
router.get('/my-orders', authMiddleware, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: orders
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/order/:id
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid Order ID format' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Ensure user is authorized to see their own order
        if (order.user.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Unauthorized access to this order' });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/order/cancel/:id
router.put('/cancel/:id', authMiddleware, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid Order ID format' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Ensure user is authorized
        if (order.user.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Unauthorized access to this order' });
        }

        // Validate cancel status
        const cancellableStatuses = ['Pending', 'Confirmed', 'Processing'];
        if (!cancellableStatuses.includes(order.orderStatus)) {
            return res.status(400).json({
                success: false,
                message: `Order cannot be cancelled. Current status is ${order.orderStatus}`
            });
        }

        // Update status and restore stock
        order.orderStatus = 'Cancelled';
        await order.save();

        // Restore stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: item.quantity }
            });
        }

        res.status(200).json({
            success: true,
            message: 'Order cancelled successfully',
            data: order
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
