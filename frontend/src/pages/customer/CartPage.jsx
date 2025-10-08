import React, { useContext, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaRegCreditCard, FaMobileAlt, FaMoneyBillWave, FaTrash, FaMapMarkerAlt, FaEdit } from "react-icons/fa";
import CartContext from "../../context/CartContext";
import api from "../../api/axiosConfig";
import AddressModal from "../../components/common/AddressModal";
import "./CartPage.css";

const CartPage = () => {
  const { cartItems, updateCartItemQuantity, removeFromCart, clearCart } = useContext(CartContext);
  const [paymentMethod, setPaymentMethod] = useState("COD"); // Default
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const navigate = useNavigate();

  // Fetch user's saved address on load
  useEffect(() => {
    const fetchUserAddress = async () => {
      try {
        const { data } = await api.get("/users/profile");
        if (data.address && data.address.street) setDeliveryAddress(data.address);
      } catch (error) {
        console.error("Could not fetch user profile for address.");
      }
    };
    fetchUserAddress();
  }, []);

  const handleUseCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          await api.put("/users/location", { latitude, longitude });
          setDeliveryAddress({
            street: `Current Location (Lat: ${latitude.toFixed(2)})`,
            city: `(Lon: ${longitude.toFixed(2)})`,
          });
          toast.success("Location updated!");
        } catch (error) {
          toast.error("Could not save your location.");
        }
      },
      () => toast.error("Could not access your location. Please enable it in your browser settings.")
    );
  };

  const handleIncrease = (item) => updateCartItemQuantity(item._id, item.quantity + 1);
  const handleDecrease = (item) => {
    if (item.quantity > 1) updateCartItemQuantity(item._id, item.quantity - 1);
    else removeFromCart(item._id);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 25;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!deliveryAddress) {
      toast.error("Please set a delivery address before placing your order.");
      return;
    }
    if (cartItems.length === 0) {
      toast.info("Your cart is empty!");
      return;
    }

    setIsPlacingOrder(true);

    const pharmacyId = cartItems[0]?.pharmacy?._id;

    try {
      await api.post("/orders/cart", {
        cartItems,
        pharmacyId,
        deliveryAddress,
        paymentMethod,
      });
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

  return (
    <>
      <AddressModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSave={(newAddress) => {
          setDeliveryAddress(newAddress);
          setShowAddressModal(false);
        }}
      />

      <div className="cart-page">
        <h1>Review Your Order</h1>

        {cartItems.length === 0 ? (
          <div className="empty-cart-container">
            <p>Your cart is empty.</p>
            <Link to="/customer/dashboard" className="shop-now-btn">Shop Now</Link>
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
                        <button onClick={() => handleDecrease(item)} className="quantity-btn">−</button>
                        <span className="quantity-value">{item.quantity}</span>
                        <button onClick={() => handleIncrease(item)} className="quantity-btn">+</button>
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
              {/* --- DELIVERY ADDRESS --- */}
              <div className="delivery-address-section">
                <h3>Delivery Address</h3>
                {deliveryAddress ? (
                  <div className="address-display">
                    <p>{`${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.state || ""} ${deliveryAddress.zipCode || ""}`}</p>
                    <button onClick={() => setShowAddressModal(true)}><FaEdit /> Change</button>
                  </div>
                ) : (
                  <div className="address-actions">
                    <button onClick={handleUseCurrentLocation}><FaMapMarkerAlt /> Use Current Location</button>
                    <button onClick={() => setShowAddressModal(true)}>Enter Manually</button>
                  </div>
                )}
              </div>

              {/* --- SUMMARY --- */}
              <h3>Order Summary</h3>
              <div className="summary-row"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
              <div className="summary-row"><span>Delivery Fee</span><span>₹{deliveryFee.toFixed(2)}</span></div>
              <div className="summary-total"><span>Total</span><span>₹{total.toFixed(2)}</span></div>

              {/* --- PAYMENT METHOD --- */}
              <div className="payment-selection">
                <h3>Select Payment Method</h3>
                <div className="payment-options">
                  <div className={`payment-option ${paymentMethod === "COD" ? "selected" : ""}`} onClick={() => setPaymentMethod("COD")}>
                    <FaMoneyBillWave /><span>Cash on Delivery</span>
                  </div>
                  <div className={`payment-option ${paymentMethod === "Card" ? "selected" : ""}`} onClick={() => setPaymentMethod("Card")}>
                    <FaRegCreditCard /><span>Card</span>
                  </div>
                  <div className={`payment-option ${paymentMethod === "UPI" ? "selected" : ""}`} onClick={() => setPaymentMethod("UPI")}>
                    <FaMobileAlt /><span>UPI</span>
                  </div>
                </div>
                {paymentMethod === "Card" && <div className="payment-details-placeholder">Card payment form would appear here.</div>}
                {paymentMethod === "UPI" && <div className="payment-details-placeholder">UPI ID input would appear here.</div>}
              </div>

              {/* --- PLACE ORDER --- */}
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
    </>
  );
};

export default CartPage;
