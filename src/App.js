import React, { useState } from 'react';
import PdfViewerHeader from './components/PdfViewerHeader';
import PdfDocumentCard from './components/PdfDocumentCard';
import PdfViewerDisplay from './components/PdfViewerDisplay';
import HistoryList from './components/HistoryList';
import CloudStorageModal from './components/CloudStorageModal';
import SharePointUploader from './components/SharePointUploader';
import { extractPdfData, generateCSV } from './utils/pdfUtils';
import { sharePointService } from './utils/sharePointService';

const App = () => {
  const [pdfs, setPdfs] = useState([]);
  const [currentPdfUrl, setCurrentPdfUrl] = useState(null);
  const [selectedPdfId, setSelectedPdfId] = useState(null);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);

  const handleBrowse = async () => {
    try {
      const filePath = await window.electronAPI.openFile();
      if (!filePath) {
        setMessage('No se seleccionó ningún archivo.');
        return;
      }
      const newPdf = {
        id: Date.now(),
        name: filePath.split(/[\\/]/).pop(),
        size: '—',
        url: filePath,
      };
      setPdfs((prev) => [...prev, newPdf]);
      setCurrentPdfUrl(filePath);
      setSelectedPdfId(newPdf.id);
      setMessage(`Archivo cargado: ${newPdf.name}`);

      setHistory((prev) =>
        prev.includes(filePath) ? prev : [filePath, ...prev].slice(0, 10)
      );
    } catch (error) {
      console.error('Error al abrir el archivo:', error);
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleSavePDF = async () => {
    if (!currentPdfUrl) {
      setMessage('Por favor, selecciona un archivo PDF primero.');
      return;
    }

    try {
      setMessage('Guardando PDF en SharePoint...');
      
      // Obtener el contenido del archivo
      const buffer = await window.electronAPI.loadPDFData(currentPdfUrl);
      const file = new File([buffer], currentPdfUrl.split(/[\\/]/).pop(), { type: 'application/pdf' });
      
      // Subir a SharePoint
      const result = await sharePointService.uploadPDF(file, file.name);
      
      if (result.success) {
        setMessage(`PDF guardado exitosamente en SharePoint: ${result.fileName}`);
      } else {
        setMessage(`Error al guardar en SharePoint: ${result.error}`);
      }
    } catch (error) {
      console.error('Error al guardar el PDF:', error);
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleCloudSave = async (service) => {
    try {
      let result;
      if (service === 'googledrive') {
        result = await window.electronAPI.saveToGoogleDrive(currentPdfUrl);
      } else if (service === 'onedrive') {
        result = await window.electronAPI.saveToOneDrive(currentPdfUrl);
      }

      if (result.success) {
        setMessage(`PDF guardado exitosamente en ${service === 'googledrive' ? 'Google Drive' : 'OneDrive'}`);
      } else {
        setMessage(`Error al guardar en ${service}: ${result.error}`);
      }
    } catch (error) {
      console.error('Error al guardar en la nube:', error);
      setMessage(`Error al guardar en la nube: ${error.message}`);
    }
  };

  const handleSaveText = async () => {
    const text = 'Este es un texto de ejemplo para guardar.';
    try {
      const result = await window.electronAPI.saveText(text);
      setMessage(result.success
        ? `Texto guardado en: ${result.path}`
        : `Error al guardar el texto: ${result.error}`);
    } catch (error) {
      console.error('Error al guardar el texto:', error);
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleClear = () => {
    if (!currentPdfUrl) {
      setMessage('No hay PDF seleccionado para eliminar.');
      return;
    }
    const pdfToRemove = pdfs.find((pdf) => pdf.url === currentPdfUrl);
    if (pdfToRemove) {
      setPdfs((prev) => prev.filter((pdf) => pdf.id !== pdfToRemove.id));
      setCurrentPdfUrl(null);
      setSelectedPdfId(null);
      setMessage(`PDF "${pdfToRemove.name}" eliminado.`);
    }
  };

  const handleRemovePdf = (id) => {
    const pdfToRemove = pdfs.find((pdf) => pdf.id === id);
    if (pdfToRemove) {
      setPdfs((prev) => prev.filter((pdf) => pdf.id !== id));
      if (currentPdfUrl === pdfToRemove.url) {
        setCurrentPdfUrl(null);
        setSelectedPdfId(null);
      }
      setMessage(`PDF "${pdfToRemove.name}" eliminado.`);
    }
  };

  const handleSelectPdf = (id) => {
    const pdfToSelect = pdfs.find((pdf) => pdf.id === id);
    if (pdfToSelect) {
      setCurrentPdfUrl(pdfToSelect.url);
      setSelectedPdfId(id);
    }
  };

  const handleSelectFromHistory = (filePath) => {
    const existing = pdfs.find((pdf) => pdf.url === filePath);
    if (existing) {
      setCurrentPdfUrl(existing.url);
      setSelectedPdfId(existing.id);
    } else {
      const newPdf = {
        id: Date.now(),
        name: filePath.split(/[\\/]/).pop(),
        size: '—',
        url: filePath,
      };
      setPdfs((prev) => [...prev, newPdf]);
      setCurrentPdfUrl(filePath);
      setSelectedPdfId(newPdf.id);
    }
    setMessage(`Archivo seleccionado desde historial.`);
  };

  const handleExportData = async () => {
    if (pdfs.length === 0) {
      setMessage('No hay PDFs cargados para exportar datos.');
      return;
    }

    try {
      setMessage('Procesando PDFs...');
      const pdfDataArray = [];

      // Extraer datos de cada PDF
      for (const pdf of pdfs) {
        const buffer = await window.electronAPI.loadPDFData(pdf.url);
        const data = await extractPdfData(buffer);
        pdfDataArray.push(data);
      }

      // Generar CSV
      const csvContent = generateCSV(pdfDataArray);
      
      // Guardar CSV
      const result = await window.electronAPI.saveText(csvContent);
      
      setMessage(result.success
        ? `Datos exportados exitosamente a: ${result.path}`
        : `Error al exportar datos: ${result.error}`);
    } catch (error) {
      console.error('Error al exportar datos:', error);
      setMessage(`Error al exportar datos: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <PdfViewerHeader
        onBrowse={handleBrowse}
        onUpload={handleBrowse}
        onSave={handleSavePDF}
        onExport={handleExportData}
        onClear={handleClear}
      />
      {message && (
        <div className="bg-yellow-100 text-yellow-700 p-3 rounded mb-4 shadow">{message}</div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PdfViewerDisplay filePath={currentPdfUrl} />
        </div>
        
        <div className="space-y-6">
          <SharePointUploader />
          
          <div className="bg-white rounded-xl shadow-lg p-4">
            <h2 className="text-xl font-semibold mb-4">PDFs Cargados</h2>
            <div className="space-y-2">
              {pdfs.map((pdf) => (
                <PdfDocumentCard
                  key={pdf.id}
                  pdf={pdf}
                  isSelected={pdf.id === selectedPdfId}
                  onSelect={() => handleSelectPdf(pdf.id)}
                  onRemove={() => handleRemovePdf(pdf.id)}
                />
              ))}
            </div>
          </div>

          <HistoryList
            history={history}
            onSelect={handleSelectFromHistory}
          />
        </div>
      </div>

      <CloudStorageModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
        onSave={handleCloudSave}
      />
    </div>
  );
};

export default App;
