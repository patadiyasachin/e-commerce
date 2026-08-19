const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    subtotal: {
        type: Number,
        required: true,
    },
});

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        orderNumber: {
            type: String,
            required: true,
            unique: true,
        },

        items: [orderItemSchema],

        shippingAddress: {
            fullName: {
                type: String,
                required: true
            },
            phone: {
                type: String,
                required: true
            },
            address: {
                type: String,
                required: true
            },
            city: {
                type: String,
                required: true
            },
            state: {
                type: String,
                required: true
            },
            pincode: {
                type: String,
                required: true
            },
        },

        subtotal: {
            type: Number,
            required: true,
        },

        shippingCharge: {
            type: Number,
            required: true,
            default: 0,
        },

        tax: {
            type: Number,
            required: true,
            default: 0,
        },

        discount: {
            type: Number,
            required: true,
            default: 0,
        },

        totalAmount: {
            type: Number,
            required: true,
        },

        paymentMethod: {
            type: String,
            required: true,
            enum: [
                'Cash on Delivery',
                'Online Payment'
            ],
        },

        paymentStatus: {
            type: String,
            required: true,
            enum: [
                'Pending',
                'Paid',
                'Failed',
                'Refunded'
            ],
            default: 'Pending',
        },

        orderStatus: {
            type: String,
            required: true,
            enum: [
                'Pending',
                'Confirmed',
                'Processing',
                'Shipped',
                'Out for Delivery',
                'Delivered',
                'Cancelled'
            ],
            default: 'Pending',
        },
    },

    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Order', orderSchema);