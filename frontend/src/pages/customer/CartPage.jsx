import React, { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaRegCreditCard, FaMobileAlt, FaMoneyBillWave, FaTrash } from "react-icons/fa";
import CartContext from "../../context/CartContext";
import api from "../../api/axiosConfig";
import "./CartPage.css";

const CartPage = () => {
  const { cartItems, updateCartItemQuantity, removeFromCart, clearCart } = useContext(CartContext);
  const [paymentMethod, setPaymentMethod] = useState("COD"); // Default to Cash on Delivery
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const navigate = useNavigate();

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

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      toast.info("Your cart is empty!");
      return;
    }

    setIsPlacingOrder(true);
    const pharmacyId = cartItems[0]?.pharmacy?._id;
    const deliveryAddress = {
      street: "123 Health St",
      city: "Wellness City",
      state: "ST",
      zipCode: "54321",
    };

    try {
      await api.post("/orders/cart", { cartItems, pharmacyId, deliveryAddress, paymentMethod });
      toast.success("Order placed successfully!");
      clearCart();
      navigate("/customer/orders");
    } catch (error) {
      console.error("Order placement failed:", error);
      toast.error(error.response?.data?.message || "Failed to place order. Please try again later.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 25;
  const total = subtotal + deliveryFee;

  return (
    <div className="cart-page">
      <h1>My Cart</h1>

      {cartItems.length === 0 ? (
        <div className="empty-cart-container">
          <p>Your cart is empty.</p>
          <Link to="/customer/dashboard" className="shop-now-btn">
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="cart-content">
          {/* ===================== LEFT PANEL: ITEMS ===================== */}
          <div className="cart-items-panel">
            <h3>Items in Cart</h3>
            <div className="cart-items-list">
              {cartItems.map((item) => (
                <div key={item._id} className="cart-item">
                  <div className="cart-item-info">
                    <span className="item-name">{item.name}</span>
                    <span className="item-price">
                      from {item.pharmacy?.pharmacyProfile?.shopName || "Pharmacy"}
                    </span>
                    <div className="quantity-controls">
                      <button onClick={() => handleDecrease(item)} className="quantity-btn">
                        −
                      </button>
                      <span className="quantity-value">{item.quantity}</span>
                      <button onClick={() => handleIncrease(item)} className="quantity-btn">
                        +
                      </button>
                    </div>
                  </div>
                  <div className="cart-item-actions">
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    <button onClick={() => removeFromCart(item._id)} className="remove-item-btn">
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ===================== RIGHT PANEL: SUMMARY ===================== */}
          <div className="cart-summary-panel">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Fee</span>
              <span>₹{deliveryFee.toFixed(2)}</span>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>

            {/* ===================== PAYMENT SELECTION ===================== */}
            <div className="payment-selection">
              <h3>Select Payment Method</h3>
              <div className="payment-options">
                <div
                  className={`payment-option ${paymentMethod === "COD" ? "selected" : ""}`}
                  onClick={() => setPaymentMethod("COD")}
                >
                  <FaMoneyBillWave />
                  <span>Cash on Delivery</span>
                </div>
                <div
                  className={`payment-option ${paymentMethod === "Card" ? "selected" : ""}`}
                  onClick={() => setPaymentMethod("Card")}
                >
                  <FaRegCreditCard />
                  <span>Card</span>
                </div>
                <div
                  className={`payment-option ${paymentMethod === "UPI" ? "selected" : ""}`}
                  onClick={() => setPaymentMethod("UPI")}
                >
                  <FaMobileAlt />
                  <span>UPI</span>
                </div>
              </div>

              {paymentMethod === "Card" && (
                <div className="payment-details-placeholder">Card payment form would appear here.</div>
              )}
              {paymentMethod === "UPI" && (
                <div className="payment-details-placeholder">UPI ID input would appear here.</div>
              )}
            </div>

            {/* ===================== PLACE ORDER BUTTON ===================== */}
            <button
              onClick={handlePlaceOrder}
              className="place-order-btn"
              disabled={isPlacingOrder}
            >
              {isPlacingOrder ? "Placing Order..." : `Pay ₹${total.toFixed(2)}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
