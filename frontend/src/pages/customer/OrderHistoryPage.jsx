import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { saveAs } from 'file-saver';
import { FaFileInvoice } from 'react-icons/fa';
import '../../assets/styles/OrderHistoryPage.css';

const OrderHistoryPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const { data } = await api.get('/orders/my-orders');
                setOrders(data);
            } catch (error) {
                console.error("Failed to fetch order history:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const handleDownloadInvoice = async (orderId) => {
        try {
            const response = await api.get(`/orders/${orderId}/invoice`, {
                responseType: 'blob', // For file download
            });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            saveAs(blob, `invoice-${orderId}.pdf`);
        } catch (error) {
            console.error('Failed to download invoice:', error);
        }
    };

    const filteredOrders = orders.filter(order => filter === 'All' || order.status === filter);

    return (
        <div className="order-history-container">
            <h1>My Orders</h1>

            {/* ---- Filter Dropdown ---- */}
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

            {loading && <p>Loading your orders...</p>}
            {!loading && filteredOrders.length === 0 && (
                <p>You have no orders matching this filter.</p>
            )}

            {/* ---- Orders List ---- */}
            <div className="orders-list">
                {filteredOrders.map(order => (
                    <div key={order._id} className="order-card">

                        {/* ---- Header with Order ID, Payment, and Status ---- */}
                        <div className="order-card-header">
                            <h3>Order ID: {order._id.substring(0, 8)}...</h3>
                            <div className="order-header-tags">
                                <span className="payment-method-tag">
                                    {order.paymentMethod || 'COD'}
                                </span>
                                <span
                                    className={`order-status-tag status-${order.status.toLowerCase().replace(/\s+/g, '-')}`}
                                >
                                    {order.status}
                                </span>
                            </div>
                        </div>

                        {/* ---- Order Info ---- */}
                        <div className="order-card-body">
                            <p className="order-date">
                                Placed on: {new Date(order.createdAt).toLocaleString()}
                            </p>

                            <h4>Items:</h4>
                            {order.prescriptionImage ? (
                                <div className="prescription-order-info">
                                    <p>This is a prescription-based order.</p>
                                    <a
                                        href={`http://localhost:5000/${order.prescriptionImage}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="view-prescription-btn"
                                    >
                                        View Prescription
                                    </a>
                                </div>
                            ) : order.medicines.length > 0 ? (
                                <ul>
                                    {order.medicines.map(med => (
                                        <li key={med.medicineId}>
                                            {med.name} (Qty: {med.quantity}) - <em>{med.status}</em>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>Items pending pharmacy review from prescription.</p>
                            )}
                        </div>

                        {/* ---- Footer ---- */}
                        <div className="order-card-footer">
                            <p className="total-amount">Total: ₹{order.totalAmount.toFixed(2)}</p>
                            <button
                                onClick={() => handleDownloadInvoice(order._id)}
                                className="invoice-btn"
                                disabled={order.status !== 'Delivered'}
                            >
                                <FaFileInvoice /> Download Invoice
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderHistoryPage;
