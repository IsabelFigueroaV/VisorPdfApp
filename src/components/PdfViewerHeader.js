import React from 'react';

const buttonBase =
  "px-6 py-3 text-lg text-white rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2";

const PdfViewerHeader = ({ onBrowse, onUpload, onSave, onExport, onClear }) => {
  return (
    <header className="p-6 bg-white shadow-md rounded-lg mb-6 flex flex-col md:flex-row justify-between items-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-4 md:mb-0">Visor de Archivos PDF</h1>
      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={onBrowse}
          className={`${buttonBase} bg-blue-600 hover:bg-blue-700 focus:ring-blue-500`}
        >
          Examinar
        </button>
        <button
          onClick={onUpload}
          className={`${buttonBase} bg-green-600 hover:bg-green-700 focus:ring-green-500`}
        >
          Cargar PDF
        </button>
        <button
          onClick={onSave}
          className={`${buttonBase} bg-purple-600 hover:bg-purple-700 focus:ring-purple-500`}
        >
          Guardar en la nube
        </button>
        <button
          onClick={onExport}
          className={`${buttonBase} bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500`}
        >
          Exportar datos
        </button>
        <button
          onClick={onClear}
          className={`${buttonBase} bg-red-600 hover:bg-red-700 focus:ring-red-500`}
        >
          Limpiar / Eliminar
        </button>
      </div>
    </header>
  );
};

export default PdfViewerHeader;
