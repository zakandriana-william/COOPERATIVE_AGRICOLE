import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const RapportsPage = () => {
  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRapports = async () => {
      try {
        const response = await api.get('/recoltes');
        setRapports(response.data);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRapports();
  }, []);

  if (loading) return <div className="p-6">Chargement...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Rapports des Récoltes</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">ID</th>
              <th className="px-6 py-3 text-left">Nom</th>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-left">Quantité</th>
            </tr>
          </thead>
          <tbody>
            {rapports.map((rapport) => (
              <tr key={rapport.id}>
                <td className="px-6 py-4">{rapport.id}</td>
                <td className="px-6 py-4">{rapport.nom || 'N/A'}</td>
                <td className="px-6 py-4">{rapport.date || 'N/A'}</td>
                <td className="px-6 py-4">{rapport.quantite || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RapportsPage;
