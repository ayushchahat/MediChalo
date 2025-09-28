import React, { useContext } from 'react';
import CartContext from '../../context/CartContext';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './CartPage.css';

const CartPage = () => {
    const { cartItems, removeFromCart, clearCart } = useContext(CartContext);
    const navigate = useNavigate();

    const handlePlaceOrder = async () => {
        // For this MVP, we assume all items are from the same pharmacy.
        // A real app would group items by pharmacy and create multiple orders.
        if (cartItems.length === 0) return;
        
        const pharmacyId = cartItems[0].pharmacy._id;
        const deliveryAddress = { street: "123 Main St", city: "Anytown", state: "CA", zipCode: "12345" }; // Placeholder address

        try {
            await api.post('/orders/cart', { cartItems, pharmacyId, deliveryAddress });
            toast.success("Order placed successfully!");
            clearCart();
            navigate('/customer/orders');
        } catch (error) {
            toast.error("Failed to place order.");
        }
    };
    
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <div className="cart-page">
            <h1>My Cart</h1>
            {cartItems.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <div className="cart-content">
                    <div className="cart-items-list">
                        {cartItems.map(item => (
                            <div key={item._id} className="cart-item">
                                <span>{item.name} (x{item.quantity})</span>
                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                                <button onClick={() => removeFromCart(item._id)}>Remove</button>
                            </div>
                        ))}
                    </div>
                    <div className="cart-summary">
                        <h3>Total: ${total.toFixed(2)}</h3>
                        <button onClick={handlePlaceOrder} className="place-order-btn">Place Order</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;
