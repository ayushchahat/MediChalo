import React from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import '../../assets/styles/AddMedicinePage.css'; // Assuming you have a corresponding CSS file

const AddMedicinePage = () => {
    const navigate = useNavigate();

    // Formik hook for form management
    const formik = useFormik({
        // Initial values for all form fields
        initialValues: {
            name: '',
            batchNumber: '',
            expiryDate: '',
            quantity: '',
            price: '',
            prescriptionRequired: false,
            image: null, // To hold the file object
        },
        // Yup validation schema to define rules for each field
        validationSchema: Yup.object({
            name: Yup.string().required('Medicine name is required'),
            batchNumber: Yup.string().required('Batch number is required'),
            expiryDate: Yup.date().required('Expiry date is required').min(new Date(), 'Expiry date must be in the future'),
            quantity: Yup.number().required('Quantity is required').min(0, 'Quantity cannot be negative'),
            price: Yup.number().required('Price is required').min(0, 'Price cannot be negative'),
            prescriptionRequired: Yup.boolean(),
            image: Yup.mixed().nullable() // Image is optional
        }),
        // Submission handler
        onSubmit: async (values, { setSubmitting }) => {
            // FormData is necessary for sending files (multipart/form-data)
            const formData = new FormData();
            
            // Append all form values to the FormData object
            Object.keys(values).forEach(key => {
                formData.append(key, values[key]);
            });

            try {
                // Send the POST request to the backend inventory endpoint
                await api.post('/inventory', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                toast.success('Medicine added successfully!');
                navigate('/pharmacy/inventory'); // Redirect to inventory on success
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to add medicine.');
                console.error("Add Medicine Error:", error);
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <div className="add-medicine-page">
            <div className="form-container">
                <h1>Add New Medicine</h1>
                <p>Fill out the details below to add a new item to your inventory.</p>
                
                <form onSubmit={formik.handleSubmit} className="add-medicine-form">
                    {/* Medicine Name */}
                    <div className="form-group">
                        <label htmlFor="name">Medicine Name</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            {...formik.getFieldProps('name')}
                        />
                        {formik.touched.name && formik.errors.name ? (
                            <div className="error-message">{formik.errors.name}</div>
                        ) : null}
                    </div>

                    {/* Batch Number */}
                    <div className="form-group">
                        <label htmlFor="batchNumber">Batch Number</label>
                        <input
                            id="batchNumber"
                            name="batchNumber"
                            type="text"
                            {...formik.getFieldProps('batchNumber')}
                        />
                        {formik.touched.batchNumber && formik.errors.batchNumber ? (
                            <div className="error-message">{formik.errors.batchNumber}</div>
                        ) : null}
                    </div>

                    {/* Expiry Date */}
                    <div className="form-group">
                        <label htmlFor="expiryDate">Expiry Date</label>
                        <input
                            id="expiryDate"
                            name="expiryDate"
                            type="date"
                            {...formik.getFieldProps('expiryDate')}
                        />
                        {formik.touched.expiryDate && formik.errors.expiryDate ? (
                            <div className="error-message">{formik.errors.expiryDate}</div>
                        ) : null}
                    </div>

                    {/* Quantity & Price (in a row) */}
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="quantity">Stock Quantity</label>
                            <input
                                id="quantity"
                                name="quantity"
                                type="number"
                                {...formik.getFieldProps('quantity')}
                            />
                            {formik.touched.quantity && formik.errors.quantity ? (
                                <div className="error-message">{formik.errors.quantity}</div>
                            ) : null}
                        </div>
                        <div className="form-group">
                            <label htmlFor="price">Price (₹)</label>
                            <input
                                id="price"
                                name="price"
                                type="number"
                                step="0.01"
                                {...formik.getFieldProps('price')}
                            />
                            {formik.touched.price && formik.errors.price ? (
                                <div className="error-message">{formik.errors.price}</div>
                            ) : null}
                        </div>
                    </div>
                    
                    {/* Medicine Image Upload */}
                    <div className="form-group">
                        <label htmlFor="image">Medicine Image (Optional)</label>
                        <input
                            id="image"
                            name="image"
                            type="file"
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={(event) => {
                                formik.setFieldValue("image", event.currentTarget.files[0]);
                            }}
                        />
                    </div>

                    {/* Prescription Required Checkbox */}
                    <div className="form-group-checkbox">
                        <input
                            id="prescriptionRequired"
                            name="prescriptionRequired"
                            type="checkbox"
                            checked={formik.values.prescriptionRequired}
                            {...formik.getFieldProps('prescriptionRequired')}
                        />
                        <label htmlFor="prescriptionRequired">Prescription Required</label>
                    </div>
                    
                    {/* Submit Button */}
                    <button type="submit" disabled={formik.isSubmitting} className="submit-btn">
                        {formik.isSubmitting ? 'Adding...' : 'Add Medicine'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddMedicinePage;

