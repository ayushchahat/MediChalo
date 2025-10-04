import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import { FaPlus, FaTrash, FaPencilAlt } from 'react-icons/fa';
import '../../assets/styles/InventoryPage.css'; // Ensure you have this CSS file

// --- Reusable Modal Component ---
const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close-btn" onClick={onClose}>&times;</button>
                {children}
            </div>
        </div>
    );
};

const InventoryPage = () => {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState(null);

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            const { data } = await api.get('/inventory');
            setMedicines(data);
        } catch (error) {
            toast.error("Failed to fetch inventory.");
        } finally {
            setLoading(false);
        }
    };

    // --- Delete Functionality ---
    const handleDeleteClick = (medicine) => {
        setSelectedMedicine(medicine);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await api.delete(`/inventory/${selectedMedicine._id}`);
            toast.success(`'${selectedMedicine.name}' was deleted successfully.`);
            setMedicines(medicines.filter(med => med._id !== selectedMedicine._id));
            setShowDeleteModal(false);
            setSelectedMedicine(null);
        } catch (error) {
            toast.error("Failed to delete medicine.");
        }
    };

    // --- Edit Functionality ---
    const handleEditClick = (medicine) => {
        setSelectedMedicine({ ...medicine, expiryDate: medicine.expiryDate.split('T')[0] });
        setShowEditModal(true);
    };
    
    const handleUpdateChange = (e) => {
        const { name, value } = e.target;
        setSelectedMedicine(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data: updatedMedicine } = await api.put(`/inventory/${selectedMedicine._id}`, selectedMedicine);
            toast.success(`'${selectedMedicine.name}' was updated successfully.`);
            setMedicines(medicines.map(med => med._id === updatedMedicine._id ? updatedMedicine : med));
            setShowEditModal(false);
            setSelectedMedicine(null);
        } catch (error) {
            toast.error("Failed to update medicine.");
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (loading) return <div className="loading-spinner">Loading Inventory...</div>;

    return (
        <div className="inventory-page">
            <header className="inventory-header">
                <h1>My Inventory</h1>
                <Link to="/pharmacy/add-medicine" className="add-medicine-btn">
                    <FaPlus /> Add New Medicine
                </Link>
            </header>

            {medicines.length === 0 ? (
                <div className="no-medicines-card">
                    {/* No medicines available */}
                </div>
            ) : (
                <div className="medicines-table-container">
                    <table className="medicines-table">
                        <thead>
                            <tr>
                                <th>Medicine Name</th>
                                <th>Batch No.</th>
                                <th>Stock</th>
                                <th>Price ($)</th>
                                <th>Expiry Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {medicines.map((med) => (
                                <tr key={med._id}>
                                    <td>{med.name}</td>
                                    <td>{med.batchNumber}</td>
                                    <td>{med.quantity}</td>
                                    <td>{med.price.toFixed(2)}</td>
                                    <td>{formatDate(med.expiryDate)}</td>
                                    <td className="actions-cell">
                                        <button onClick={() => handleEditClick(med)} className="action-btn-edit"><FaPencilAlt /></button>
                                        <button onClick={() => handleDeleteClick(med)} className="action-btn-delete"><FaTrash /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                <h2>Confirm Deletion</h2>
                <p>Are you sure you want to delete <strong>{selectedMedicine?.name}</strong>? This action cannot be undone.</p>
                <div className="modal-actions">
                    <button className="modal-btn cancel" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                    <button className="modal-btn confirm-delete" onClick={confirmDelete}>Delete</button>
                </div>
            </Modal>

            {/* Edit Medicine Modal */}
            <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)}>
                <h2>Edit Medicine</h2>
                <form onSubmit={handleUpdateSubmit} className="edit-form">
                    <div className="form-group">
                        <label>Name</label>
                        <input type="text" name="name" value={selectedMedicine?.name || ''} onChange={handleUpdateChange} />
                    </div>
                    <div className="form-group">
                        <label>Quantity</label>
                        <input type="number" name="quantity" value={selectedMedicine?.quantity || ''} onChange={handleUpdateChange} />
                    </div>
                    <div className="form-group">
                        <label>Price ($)</label>
                        <input type="number" step="0.01" name="price" value={selectedMedicine?.price || ''} onChange={handleUpdateChange} />
                    </div>
                    <div className="form-group">
                        <label>Expiry Date</label>
                        <input type="date" name="expiryDate" value={selectedMedicine?.expiryDate || ''} onChange={handleUpdateChange} />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="modal-btn cancel" onClick={() => setShowEditModal(false)}>Cancel</button>
                        <button type="submit" className="modal-btn confirm-edit">Save Changes</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default InventoryPage;
