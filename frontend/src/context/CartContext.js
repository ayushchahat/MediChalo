import React, { createContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        try {
            const localData = localStorage.getItem('cart');
            return localData ? JSON.parse(localData) : [];
        } catch (error) {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    // ✅ Add medicine to cart or increase quantity if already present
    const addToCart = (medicine) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item._id === medicine._id);
            if (existingItem) {
                toast.info(`${medicine.name} quantity updated in cart.`);
                return prevItems.map(item =>
                    item._id === medicine._id ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                toast.success(`${medicine.name} added to cart.`);
                return [...prevItems, { ...medicine, quantity: 1 }];
            }
        });
    };

    // ❌ Remove a specific item completely
    const removeFromCart = (medicineId) => {
        setCartItems(prevItems => prevItems.filter(item => item._id !== medicineId));
        toast.error("Item removed from cart.");
    };

    // 🔄 Update quantity for + and - buttons
    const updateCartItemQuantity = (medicineId, newQuantity) => {
        setCartItems(prevItems => {
            if (newQuantity <= 0) {
                toast.error("Item removed from cart.");
                return prevItems.filter(item => item._id !== medicineId);
            }

            return prevItems.map(item =>
                item._id === medicineId ? { ...item, quantity: newQuantity } : item
            );
        });
    };

    // 🧹 Clear the entire cart
    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('cart');
    };

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                clearCart,
                updateCartItemQuantity
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;
