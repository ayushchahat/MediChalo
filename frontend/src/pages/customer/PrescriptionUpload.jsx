import React, { useState } from 'react';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import { FaUpload, FaCheckCircle } from 'react-icons/fa';
import '../../assets/styles/PrescriptionUpload.css';

const PrescriptionUpload = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    
    // This is a placeholder. In a real app, you'd fetch pharmacies
    // or have the user select one.
    const placeholderPharmacyId = "60c72b2f9b1d8c001c8e4d8c";

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            toast.error("Please select a file to upload.");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('prescription', file);
        // IMPORTANT: You need to send a pharmacyId. This should come from a selection UI.
        formData.append('pharmacyId', placeholderPharmacyId); 

        try {
            await api.post('/orders/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success("Prescription uploaded successfully! A pharmacy will review it shortly.");
            setFile(null); // Reset file input
        } catch (error) {
            console.error("Upload failed:", error);
            toast.error(error.response?.data?.message || 'Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="prescription-upload">
            <h3>Upload Prescription</h3>
            <p>Upload an image or PDF of your prescription.</p>
            <form onSubmit={handleSubmit}>
                <label htmlFor="file-upload" className={`upload-label ${file ? 'file-selected' : ''}`}>
                    {file ? <FaCheckCircle /> : <FaUpload />}
                    <span>{file ? file.name : 'Choose File'}</span>
                </label>
                <input id="file-upload" type="file" onChange={handleFileChange} accept="image/*,application/pdf" />
                <button type="submit" className="upload-button" disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Submit Prescription'}
                </button>
            </form>
        </div>
    );
};

export default PrescriptionUpload;
