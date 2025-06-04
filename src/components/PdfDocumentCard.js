import React, { useEffect, useRef, useState } from 'react';
import { getDocument } from 'pdfjs-dist';

const PdfDocumentCard = ({ pdf, onSelect, onRemove, isSelected }) => {
  const canvasRef = useRef(null);
  const [thumbnail, setThumbnail] = useState(null);

  useEffect(() => {
    const generateThumbnail = async () => {
      if (!pdf.url || !window.electronAPI?.loadPDFData) return;
      try {
        const buffer = await window.electronAPI.loadPDFData(pdf.url);
        const { promise } = getDocument({ data: buffer });
        const pdfDoc = await promise;
        const page = await pdfDoc.getPage(1);
        
        // Configurar el canvas para la miniatura
        const canvas = canvasRef.current;
        const viewport = page.getViewport({ scale: 0.3 }); // Escala pequeña para miniatura
        const context = canvas.getContext('2d');
        
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        // Renderizar la miniatura
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
        
        setThumbnail(true);
      } catch (err) {
        console.error('Error al generar miniatura:', err);
      }
    };
    
    generateThumbnail();
  }, [pdf.url]);

  return (
    <div
      className={`relative p-4 bg-white rounded-lg shadow-md cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105 ${
        isSelected ? 'border-4 border-blue-500' : 'border-4 border-transparent'
      }`}
      onClick={() => onSelect(pdf.id)}
    >
      {/* Nombre del archivo */}
      <h3
        className="text-lg font-semibold text-gray-800 truncate mb-2"
        title={pdf.name}
      >
        {pdf.name}
      </h3>

      {/* Miniatura del PDF */}
      <div className="w-full h-32 flex items-center justify-center rounded-md bg-red-50 overflow-hidden">
        <canvas 
          ref={canvasRef}
          className="max-w-full max-h-full object-contain"
        />
        {!thumbnail && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-12 h-12 text-red-600"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <path
              fillRule="evenodd"
              d="M14 2v6h6"
              clipRule="evenodd"
              className="text-red-400"
            />
            <text
              x="12"
              y="17"
              textAnchor="middle"
              fontSize="6"
              fill="currentColor"
              className="font-bold"
            >
              PDF
            </text>
          </svg>
        )}
      </div>

      {/* Botón eliminar */}
      <button
        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(pdf.id);
        }}
        title="Eliminar PDF"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};

export default PdfDocumentCard;
