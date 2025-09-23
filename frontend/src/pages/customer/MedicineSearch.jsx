import React, { useState } from 'react';
import api from '../../api/axiosConfig';
import { FaSearch, FaPills } from 'react-icons/fa';
import '../../assets/styles/MedicineSearch.css';

const MedicineSearch = () => {
    const [keyword, setKeyword] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('Search for medicines available in nearby pharmacies.');

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!keyword.trim()) return;

        setLoading(true);
        setResults([]);
        setMessage('');

        try {
            const { data } = await api.get(`/inventory/search?keyword=${keyword}`);
            setResults(data);
            if (data.length === 0) {
                setMessage(`No medicine found for "${keyword}".`);
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setMessage(`No medicine found for "${keyword}".`);
            } else {
                setMessage('An error occurred while searching.');
            }
            console.error("Search error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="medicine-search">
            <h3>Find Medicines</h3>
            <form onSubmit={handleSearch} className="search-form">
                <div className="search-input-group">
                    <FaSearch className="search-icon" />
                    <input 
                        type="text" 
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="e.g., Paracetamol"
                        className="search-input"
                    />
                </div>
                <button type="submit" className="search-button" disabled={loading}>
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </form>

            <div className="search-results">
                {loading && <p>Loading...</p>}
                {!loading && results.length === 0 && <p className="search-message">{message}</p>}
                {results.length > 0 && (
                    <ul className="results-list">
                        {results.map(med => (
                            <li key={med._id} className="result-item">
                                <FaPills className="pill-icon" />
                                <div className="med-info">
                                    <span className="med-name">{med.name}</span>
                                    <span className="pharmacy-name">at {med.pharmacy?.name || 'Unknown Pharmacy'}</span>
                                </div>
                                <div className="med-details">
                                    <span className="med-price">${med.price.toFixed(2)}</span>
                                    <span className={`med-stock ${med.quantity > 10 ? 'in-stock' : 'low-stock'}`}>
                                        {med.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default MedicineSearch;
