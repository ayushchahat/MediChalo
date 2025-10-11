import React, { useState } from 'react';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import { FaSearch } from 'react-icons/fa';
import MedicineCard from './MedicineCard';
import '../../assets/styles/MedicineSearch.css';

const MedicineSearch = ({ customerLocation, onResults }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [message, setMessage] = useState('Search for medicines available in nearby pharmacies.');

  const handleSearch = async (e) => {
    e.preventDefault();
    console.log('Search clicked:', searchTerm); // DEBUG

    if (!searchTerm.trim()) {
      toast.info('Please enter a medicine name to search.');
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setResults([]);
    setMessage('');

    try {
      const { data } = await api.get(`/inventory/search?keyword=${encodeURIComponent(searchTerm)}`);
      console.log('API response:', data); // DEBUG
      setResults(data);
      onResults && onResults(data);

      if (data.length === 0) {
        setMessage(`No medicine found for "${searchTerm}".`);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      onResults && onResults([]);
      setMessage('An error occurred while searching.');
      toast.error('An error occurred while searching.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="medicine-search-container">
      <form onSubmit={handleSearch} className="medicine-search-form">
        <div className="search-input-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search for Paracetamol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button type="submit" className="search-btn" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      <div className="search-results-container">
        {loading && <div className="loading-spinner small">Loading results...</div>}

        {!loading && hasSearched && results.length === 0 && (
          <p className="no-results-message">{message}</p>
        )}

        {!loading && results.length > 0 && (
          <div className="search-results-grid">
            {results.map((medicine) => (
              <MedicineCard
                key={medicine._id}
                medicine={medicine}
                customerLocation={customerLocation}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicineSearch;
