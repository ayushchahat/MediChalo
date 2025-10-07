import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import { saveAs } from 'file-saver';
import { FaFileInvoiceDollar, FaMapMarkerAlt } from 'react-icons/fa';
import '../../assets/styles/OrderHistoryPage.css';

const OrderHistoryPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    // Fetch Orders
    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const { data } = await api.get('/orders/my-orders');
                setOrders(data);
            } catch (error) {
                console.error("Failed to fetch order history:", error);
                toast.error("Could not load order history.");
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    // Download Invoice
    const handleDownloadInvoice = async (orderId) => {
        try {
            toast.info("Generating your invoice...");
            const response = await api.get(`/orders/${orderId}/invoice`, {
                responseType: 'blob',
            });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            saveAs(blob, `invoice-${orderId}.pdf`);
            toast.success("Invoice downloaded successfully!");
        } catch (error) {
            console.error('Invoice Download Error:', error);
            toast.error("Could not download invoice.");
        }
    };

    // Filter Orders
    const filteredOrders = orders.filter(order => filter === 'All' || order.status === filter);

    // Format Helpers
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString();
    const formatTime = (dateString) =>
        new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (loading) return <div className="loading-spinner">Loading Your Orders...</div>;

    return (
        <div className="order-history-container">
            <h1>My Orders</h1>

            {/* Filter Dropdown */}
            <div className="filter-controls">
                <span>Filter by status:</span>
                <select onChange={(e) => setFilter(e.target.value)} value={filter}>
                    <option value="All">All</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Rejected">Rejected</option>
                </select>
            </div>

            {/* No Orders Message */}
            {!loading && filteredOrders.length === 0 && (
                <div className="no-orders-card">
                    <p>You have not placed any orders yet.</p>
                    <Link to="/customer/dashboard" className="shop-now-btn">
                        Start Shopping
                    </Link>
                </div>
            )}

            {/* Orders List */}
            <div className="orders-list">
                {filteredOrders.map(order => {
                    const isInvoiceDisabled = ['Pending', 'Rejected', 'Cancelled', 'Payment Failed'].includes(order.status);

                    return (
                        <div key={order._id} className="order-card">
                            {/* Header */}
                            <div className="order-card-header">
                                <div>
                                    <h3>Order ID: #{order._id.substring(18).toUpperCase()}</h3>
                                    <span>Placed on: {formatDate(order.createdAt)}</span>
                                </div>
                                <div className="order-header-tags">
                                    <span className="payment-method-tag">{order.paymentMethod || 'COD'}</span>
                                    <span className={`order-status-tag status-${order.status.toLowerCase().replace(/\s+/g, '-')}`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="order-card-body">
                                {order.prescriptionImage ? (
                                    <div className="prescription-order-info">
                                        <p>This is a prescription-based order. Items are being reviewed by the pharmacy.</p>
                                        <a
                                            href={`https://medichalo-backend.onrender.com/${order.prescriptionImage.replace(/\\/g, '/')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="view-prescription-btn"
                                        >
                                            View Prescription
                                        </a>
                                    </div>
                                ) : order.medicines?.length > 0 ? (
                                    <ul className="medicines-list-history">
                                        {order.medicines.map(med => (
                                            <li key={med._id || med.medicineId}>
                                                {med.name} (x{med.quantity})
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>Items pending pharmacy review from prescription.</p>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="order-card-footer">
                                <span className="order-total">Total: ₹{order.totalAmount.toFixed(2)}</span>
                                <div className="footer-actions">
                                    {order.eta && ['Accepted by Partner', 'Out for Delivery'].includes(order.status) && (
                                        <span className="order-eta">ETA: {formatTime(order.eta)}</span>
                                    )}
                                    {['Accepted by Partner', 'Out for Delivery'].includes(order.status) && (
                                        <Link to={`/track-order/${order._id}`} className="track-order-btn">
                                            <FaMapMarkerAlt /> Track Order
                                        </Link>
                                    )}
                                    <button
                                        onClick={() => handleDownloadInvoice(order._id)}
                                        className="download-invoice-btn"
                                        disabled={isInvoiceDisabled}
                                        title={isInvoiceDisabled ? "Invoice is available after an order is approved." : "Download your invoice"}
                                    >
                                        <FaFileInvoiceDollar /> Download Invoice
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OrderHistoryPage;
