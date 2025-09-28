import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';

import MedicineSearch from './MedicineSearch';
import MedicineCard from './MedicineCard';
import PrescriptionUpload from './PrescriptionUpload';
import ActiveOrders from './ActiveOrders';

import '../../assets/styles/CustomerDashboard.css';

const CustomerDashboard = () => {
  const { t } = useLanguage();
  const [allMedicines, setAllMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const { data } = await api.get('/inventory/available');
        setAllMedicines(data);
        setFilteredMedicines(data);
      } catch (error) {
        toast.error(t('fetch_medicines_error') || 'Could not fetch medicines.');
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, [t]);

  const handleSearch = (searchTerm) => {
    if (!searchTerm) {
      setFilteredMedicines(allMedicines);
    } else {
      const lowercasedTerm = searchTerm.toLowerCase();
      const filtered = allMedicines.filter((med) =>
        med.name.toLowerCase().includes(lowercasedTerm)
      );
      setFilteredMedicines(filtered);
    }
  };

  if (loading) return <div className="loading-spinner">{t('loading_medicines') || 'Loading Medicines...'}</div>;

  return (
    <div className="customer-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>{t('welcome_customer') || 'Welcome!'}</h1>
        <p>{t('customer_dashboard_subtitle') || 'Your one-stop solution for medicines, delivered right to your door.'}</p>
      </div>

      {/* Search Section */}
      <div className="dashboard-search">
        <MedicineSearch onSearch={handleSearch} />
      </div>

      {/* Medicines Grid */}
      <div className="medicines-grid">
        {filteredMedicines.length > 0 ? (
          filteredMedicines.map((med) => (
            <MedicineCard key={med._id} medicine={med} />
          ))
        ) : (
          <p>{t('no_medicines_found') || 'No medicines found matching your search.'}</p>
        )}
      </div>

      {/* Extra Features (Prescription Upload + Active Orders) */}
      <div className="dashboard-grid">
        <div className="grid-item">
          <PrescriptionUpload />
        </div>
        <div className="grid-item">
          <ActiveOrders />
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
