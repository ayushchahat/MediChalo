import React, { useState } from 'react';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import ApprovePrescriptionModal from './ApprovePrescriptionModal'; // ✅ Added for prescription approval
import '../../assets/styles/OrderManagementCard.css';

const OrderManagementCard = ({ order, onUpdate }) => {
    const [showApproveModal, setShowApproveModal] = useState(false);

    // ==============================
    // 🔹 Update order status function
    // ==============================
    const handleStatusChange = async (newStatus) => {
        try {
            await api.put(`/orders/${order._id}/status`, { status: newStatus });
            toast.success(`Order has been ${newStatus.toLowerCase()}.`);
            onUpdate(order._id);
        } catch (error) {
            toast.error("Failed to update order status.");
        }
    };

    // ==============================
    // 🔹 Handle Accept Click (for prescriptions)
    // ==============================
    const handleAcceptClick = () => {
        if (order.prescriptionImage) {
            // If it’s a prescription order → open modal
            setShowApproveModal(true);
        } else {
            // Otherwise, directly approve the order
            handleStatusChange('Approved');
        }
    };

    // ==============================
    // 🔹 Close modal and refresh if updated
    // ==============================
    const handleModalClose = (wasUpdated) => {
        setShowApproveModal(false);
        if (wasUpdated) {
            onUpdate(order._id);
        }
    };

    // ==============================
    // 🔹 Render action buttons
    // ==============================
    const renderActions = () => {
        switch (order.status) {
            case 'Pending':
                return (
                    <>
                        <button
                            onClick={() => handleStatusChange('Rejected')}
                            className="omc-btn reject"
                        >
                            Reject
                        </button>
                        <button
                            onClick={handleAcceptClick}
                            className="omc-btn approve"
                        >
                            Accept Order
                        </button>
                    </>
                );
            case 'Approved':
                return (
                    <button
                        onClick={() => handleStatusChange('Ready for Delivery')}
                        className="omc-btn ready"
                    >
                        Mark as Ready
                    </button>
                );
            default:
                return null;
        }
    };

    const customerAddress = order.customer?.address;

    return (
        <>
            {/* ✅ Prescription approval modal */}
            <ApprovePrescriptionModal
                isOpen={showApproveModal}
                onClose={handleModalClose}
                order={order}
            />

            {/* ==========================
                🔹 Order Management Card UI
            ========================== */}
            <div className="omc-card">
                {/* Header */}
                <div className="omc-header">
                    <span className="omc-order-id">
                        Order ID: {order._id.substring(0, 8)}...
                    </span>
                    <span
                        className={`omc-status-tag status-${order.status
                            .toLowerCase()
                            .replace(/ /g, '-')}`}
                    >
                        {order.status}
                    </span>
                </div>

                {/* Body */}
                <div className="omc-body">
                    {/* Customer Info */}
                    <div className="omc-customer-details">
                        <h4>Customer Details</h4>
                        <p><strong>Name:</strong> {order.customer?.name}</p>
                        <p><strong>Email:</strong> {order.customer?.email}</p>
                        {customerAddress && (
                            <p>
                                <strong>Address:</strong>{' '}
                                {`${customerAddress.street}, ${customerAddress.city}`}
                            </p>
                        )}
                    </div>

                    {/* Prescription or Medicine Info */}
                    {order.prescriptionImage ? (
                        <div className="omc-prescription-details">
                            <h4>Prescription Uploaded</h4>
                            <a
                                href={`http://localhost:5000/${order.prescriptionImage}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-view-prescription"
                            >
                                View & Download Prescription
                            </a>
                        </div>
                    ) : order.medicines && order.medicines.length > 0 ? (
                        <div className="omc-medicines-list">
                            <h4>Ordered Medicines</h4>
                            <ul>
                                {order.medicines.map((med) => (
                                    <li key={med.medicineId}>
                                        {med.name} (Qty: {med.quantity}) -{' '}
                                        <em>{med.status}</em>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <p>No items added yet.</p>
                    )}
                </div>

                {/* Footer / Actions */}
                <div className="omc-footer">{renderActions()}</div>
            </div>
        </>
    );
};

export default OrderManagementCard;
