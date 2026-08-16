const express = require('express')
const Cart = require('../models/Cart')
const authMiddleware = require('../middleware/authMiddleware')
const { route } = require('./product')
const router = express.Router()

router.post('/add', authMiddleware, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userID = req.user.id;

        let cart = await Cart.findOne({ user: userID });

        if (!cart) {
            cart = await Cart.create({
                user: userID,
                items: [
                    {
                        product: productId,
                        quantity,
                    },
                ],
            });
        } else {
            const itemIndex = cart.items.findIndex(
                (item) => item.product.toString() === productId
            );

            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += quantity;
            } else {
                cart.items.push({
                    product: productId,
                    quantity,
                });
            }

            await cart.save();
        }

        res.json({
            message: 'Added to cart',
            cart,
        });

    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
});

router.get('/', authMiddleware, async (req, res) => {
    try {
        const cart = await Cart.findOne({
            user: req.user.id,
        }).populate('items.product');

        res.json(cart || { items: [] });

    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
});

router.put('/update', authMiddleware, async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        const cart = await Cart.findOne({
            user: req.user.id,
        });

        const item = cart.items.find(
            (i) => i.product.toString() === productId
        );

        if (item) {
            item.quantity = quantity;
        }

        await cart.save();

        res.json({
            message: 'Cart updated',
            cart,
        });

    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
});

router.delete('/remove/:productId', authMiddleware, async (req, res) => {
    try {
        const cart = await Cart.findOne({
            user: req.user.id,
        });

        cart.items = cart.items.filter(
            (item) =>
                item.product.toString() !== req.params.productId
        );

        await cart.save();

        res.json({
            message: 'Item removed',
            cart,
        });

    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
});

module.exports = router