import React, { useState } from 'react';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaUpload } from 'react-icons/fa';
import '../../assets/styles/PrescriptionUpload.css';

const PrescriptionUpload = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            toast.error("Please select a prescription file to upload.");
            return;
        }
        setIsUploading(true);

        const formData = new FormData();
        formData.append('prescription', selectedFile);

        try {
            await api.post('/orders/prescription', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success("Prescription uploaded successfully! Your order has been placed.");
            // Redirect to the order history page to see the new pending order
            navigate('/customer/orders');
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to upload prescription.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="upload-card">
            <h2>Have a Prescription?</h2>
            <p>Upload a picture of your prescription and let our partner pharmacies handle the rest.</p>
            <form onSubmit={handleSubmit} className="upload-form">
                <label htmlFor="prescription-file" className="file-input-label">
                    {selectedFile ? selectedFile.name : "Choose File (JPG, PNG, PDF)"}
                </label>
                <input
                    id="prescription-file"
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={handleFileChange}
                    className="file-input"
                />
                <button type="submit" className="upload-btn" disabled={isUploading}>
                    <FaUpload /> {isUploading ? "Uploading..." : "Upload & Place Order"}
                </button>
            </form>
        </div>
    );
};

export default PrescriptionUpload;

