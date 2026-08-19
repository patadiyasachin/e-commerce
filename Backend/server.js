const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv')
dotenv.config()
const connectDb = require('./db');
const authMiddleware = require('./middleware/authMiddleware');
const user = require('./models/user');
const auth = require('./routes/auth');
const product = require('./routes/product');
const cart = require('./routes/cart')
const adminProductRoutes = require('./routes/adminProduct')
const adminUserRoutes = require('./routes/adminUser')
const orderRoutes = require('./routes/order')
const adminOrderRoutes = require('./routes/adminOrder')
const app = express();
const port = process.env.PORT || 5000

connectDb()

app.use(cors());
app.use(express.json());

app.use('/api/auth', auth);
app.use('/api/product', product)
app.use('/api/cart', cart);
app.use('/api/order', orderRoutes);
app.use('/api/admin/product', adminProductRoutes)
app.use('/api/admin/user', adminUserRoutes)
app.use('/api/admin/orders', adminOrderRoutes)

app.get('/', authMiddleware, async (req, res) => {
    const u = await user.find()
    res.send({
        message: "success !!",
        user: u
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});