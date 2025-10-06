import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CartContext from "../../context/CartContext";
import api from "../../api/axiosConfig";
import "./CartPage.css";

const CartPage = () => {
  const { cartItems, updateCartItemQuantity, removeFromCart, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      toast.info("Your cart is empty!");
      return;
    }

    const pharmacyId = cartItems[0]?.pharmacy?._id;
    const deliveryAddress = {
      street: "123 Main St",
      city: "Anytown",
      state: "CA",
      zipCode: "12345",
    };

    try {
      await api.post("/orders/cart", { cartItems, pharmacyId, deliveryAddress });
      toast.success("Order placed successfully!");
      clearCart();
      navigate("/customer/orders");
    } catch (error) {
      console.error("Order placement failed:", error);
      toast.error("Failed to place order. Please try again later.");
    }
  };

  const handleIncrease = (item) => {
    updateCartItemQuantity(item._id, item.quantity + 1);
  };

  const handleDecrease = (item) => {
    if (item.quantity > 1) {
      updateCartItemQuantity(item._id, item.quantity - 1);
    } else {
      removeFromCart(item._id);
    }
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="cart-page">
      <h1>My Cart</h1>

      {cartItems.length === 0 ? (
        <p className="empty-cart-msg">Your cart is empty.</p>
      ) : (
        <div className="cart-content">
          <div className="cart-items-list">
            {cartItems.map((item) => (
              <div key={item._id} className="cart-item">
                <div className="cart-item-info">
                  <span className="item-name">{item.name}</span>
                  <div className="quantity-controls">
                    <button
                      onClick={() => handleDecrease(item)}
                      className="quantity-btn"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="quantity-value">{item.quantity}</span>
                    <button
                      onClick={() => handleIncrease(item)}
                      className="quantity-btn"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="cart-item-price">
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Total: ₹{totalAmount.toFixed(2)}</h3>
            <button
              onClick={handlePlaceOrder}
              className="place-order-btn"
              disabled={cartItems.length === 0}
            >
              Place Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
