import React, { useState } from 'react';

const CloudStorageModal = ({ isOpen, onClose, onSave, currentFileName }) => {
  const [selectedService, setSelectedService] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async (service) => {
    setSaving(true);
    setError(null);
    try {
      if (service === 'googledrive') {
        const result = await window.electronAPI.saveToGoogleDrive(currentFileName);
        if (!result.success) {
          throw new Error(result.error || 'Error al guardar en Google Drive');
        }
      } else if (service === 'onedrive') {
        const result = await window.electronAPI.saveToOneDrive(currentFileName);
        if (!result.success) {
          throw new Error(result.error || 'Error al guardar en OneDrive');
        }
      }
      onSave(service);
      onClose();
    } catch (error) {
      console.error(`Error al guardar en ${service}:`, error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Guardar en la nube</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={() => handleSave('googledrive')}
            disabled={saving}
            className="w-full p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors flex items-center gap-3 disabled:opacity-50"
          >
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/d/da/Google_Drive_logo.png" 
              alt="Google Drive" 
              className="w-8 h-8"
            />
            <span className="text-lg">Google Drive</span>
          </button>

          <button
            onClick={() => handleSave('onedrive')}
            disabled={saving}
            className="w-full p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors flex items-center gap-3 disabled:opacity-50"
          >
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Microsoft_Office_OneDrive_%282019-present%29.svg" 
              alt="OneDrive" 
              className="w-8 h-8"
            />
            <span className="text-lg">OneDrive</span>
          </button>
        </div>

        {saving && (
          <div className="mt-4 text-center text-gray-600">
            Guardando archivo...
          </div>
        )}

        <button
          onClick={onClose}
          disabled={saving}
          className="mt-6 w-full py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default CloudStorageModal; 