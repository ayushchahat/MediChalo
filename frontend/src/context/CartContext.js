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

    const removeFromCart = (medicineId) => {
        setCartItems(prevItems => prevItems.filter(item => item._id !== medicineId));
        toast.error("Item removed from cart.");
    };
    
    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('cart');
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;
