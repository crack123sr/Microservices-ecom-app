const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');


// Get cart by userId



router.get("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            // Return empty cart if none exists
            return res.json({ userId, items: [], itemCount: 0, total: 0 });
        }

        // Calculate totals

        const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        const total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);


        res.json({
            userId: cart.userId,
            items: cart.items,
            itemCount,
            total: Math.round(total * 100) / 100
        });

    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ error: error.message });
    }
})


// Add item to cart

router.post("/:userId/add", async (req, res) => {
    try {
        const { userId } = req.params;
        const { productId, name, price, image, quantity = 1 } = req.body;

        if (!productId || !name || price === undefined) {
            return res.status(400).json({ error: 'productId, name, and price are required' });
        }


        let cart = await Cart.findOne({ userId });

        if (!cart) {
            // Create new cart
            cart = new Cart({
                userId,
                items: [{
                    productId,
                    name,
                    price,
                    image: image || '',
                    quantity
                }]
            });
        } else {
            // Check if item already exists
            const existingItemIndex = cart.items.findIndex(
                item => item.productId === productId
            );

            if (existingItemIndex > -1) {
                // Increment quantity
                cart.items[existingItemIndex].quantity += quantity;
            } else {
                // Add new item
                cart.items.push({
                    productId,
                    name,
                    price,
                    image: image || '',
                    quantity
                });
            }
        }


        await cart.save();


        // Calculate totals
        const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        const total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);


        res.status(200).json({
            message: 'Item added to cart',
            userId: cart.userId,
            items: cart.items,
            itemCount,
            total: Math.round(total * 100) / 100
        });







    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ error: error.message });
    }
})



// Update item quantity
router.put('/:userId/update', async (req, res) => {
    try {
        const { userId } = req.params;
        const { productId, quantity } = req.body;

        if (!productId || quantity === undefined) {
            return res.status(400).json({ error: 'productId and quantity are required' });
        }

        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(item => item.productId === productId);

        if (itemIndex === -1) {
            return res.status(404).json({ error: 'Item not found in cart' });
        }

        if (quantity <= 0) {
            // Remove item if quantity is 0 or less
            cart.items.splice(itemIndex, 1);
        } else {
            cart.items[itemIndex].quantity = quantity;
        }

        await cart.save();

        const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        const total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        res.json({
            message: 'Cart updated',
            userId: cart.userId,
            items: cart.items,
            itemCount,
            total: Math.round(total * 100) / 100
        });
    } catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).json({ error: error.message });
    }
});

// Remove item from cart
router.delete('/:userId/remove/:productId', async (req, res) => {
    try {
        const { userId, productId } = req.params;

        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(item => item.productId === productId);

        if (itemIndex === -1) {
            return res.status(404).json({ error: 'Item not found in cart' });
        }

        cart.items.splice(itemIndex, 1);
        await cart.save();

        const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        const total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        res.json({
            message: 'Item removed from cart',
            userId: cart.userId,
            items: cart.items,
            itemCount,
            total: Math.round(total * 100) / 100
        });
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({ error: error.message });
    }
});

// Clear cart (delete all items)
router.delete('/:userId/clear', async (req, res) => {
    try {
        const { userId } = req.params;

        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.json({ message: 'Cart already empty', userId, items: [], itemCount: 0, total: 0 });
        }

        cart.items = [];
        await cart.save();

        res.json({
            message: 'Cart cleared',
            userId: cart.userId,
            items: [],
            itemCount: 0,
            total: 0
        });
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
