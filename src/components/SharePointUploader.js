import React, { useState } from 'react';
import { sharePointService } from '../utils/sharePointService';

const SharePointUploader = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setUploadStatus('');
    } else {
      setUploadStatus('Por favor selecciona un archivo PDF');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('Por favor selecciona un archivo primero');
      return;
    }

    setIsUploading(true);
    try {
      const result = await sharePointService.uploadPDF(selectedFile, selectedFile.name);
      if (result.success) {
        setUploadStatus(`Archivo subido exitosamente a: ${result.fileUrl}`);
        setSelectedFile(null);
      } else {
        setUploadStatus(`Error al subir: ${result.error}`);
      }
    } catch (error) {
      setUploadStatus(`Error: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Subir PDF a SharePoint</h2>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className={`px-4 py-2 rounded-lg font-medium ${
              !selectedFile || isUploading
                ? 'bg-gray-300 text-gray-500'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isUploading ? 'Subiendo...' : 'Subir'}
          </button>
        </div>

        {selectedFile && (
          <div className="text-sm text-gray-600">
            Archivo seleccionado: {selectedFile.name}
          </div>
        )}

        {uploadStatus && (
          <div className={`text-sm p-3 rounded ${
            uploadStatus.includes('exitosamente')
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}>
            {uploadStatus}
          </div>
        )}
      </div>
    </div>
  );
};

export default SharePointUploader; 