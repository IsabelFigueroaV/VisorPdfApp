import React, { useEffect, useRef, useState } from 'react';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';

/* --------------------------------------------------------
   Worker local: Create-React-App copiará pdf.worker.mjs
   al bundle y esta URL file:// funcionará en desarrollo
   y en el .exe empaquetado, sin usar la CDN.
-------------------------------------------------------- */
const workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

GlobalWorkerOptions.workerSrc = workerSrc;

const PdfViewerDisplay = ({ filePath }) => {
  const canvasRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(2.5); // Aumentado a 2.5 para mejor nitidez

  // ──────────────── Cargar PDF ────────────────
  useEffect(() => {
    const loadPDF = async () => {
      if (!filePath || !window.electronAPI?.loadPDFData) return;
      try {
        const buffer = await window.electronAPI.loadPDFData(filePath);
        const { promise } = getDocument({ data: buffer });
        const pdf = await promise;

        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        setPageNumber(1);
      } catch (err) {
        console.error('Error al cargar PDF:', err);
      }
    };
    loadPDF();
  }, [filePath]);

  // ─────────────── Renderizar página ───────────────
  useEffect(() => {
    const render = async () => {
      if (!pdfDoc || !canvasRef.current) return;
      
      try {
        const page = await pdfDoc.getPage(pageNumber);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Mejorar la resolución usando el pixel ratio del dispositivo
        const pixelRatio = window.devicePixelRatio || 1;
        canvas.width = viewport.width * pixelRatio;
        canvas.height = viewport.height * pixelRatio;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        // Aplicar escala según pixel ratio
        ctx.scale(pixelRatio, pixelRatio);

        // Activar antialiasing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        await page.render({
          canvasContext: ctx,
          viewport: viewport,
          enableWebGL: true, // Usar WebGL para mejor rendimiento
        }).promise;
      } catch (err) {
        console.error('Error al renderizar página:', err);
      }
    };
    render();
  }, [pdfDoc, pageNumber, scale]);

  // ─────────────── Control de zoom ───────────────
  const zoomIn = () => setScale(prev => prev + 0.1);  // Control más fino del zoom
  const zoomOut = () => setScale(prev => prev > 0.5 ? prev - 0.1 : prev);  // Límite mínimo de 0.5
  const resetZoom = () => setScale(2.5);  // Reset al nuevo valor por defecto

  // ─────────────── Navegación ───────────────
  const prev = () => pageNumber > 1 && setPageNumber(p => p - 1);
  const next = () =>
    pdfDoc && pageNumber < totalPages && setPageNumber(p => p + 1);

  // ─────────────── UI ───────────────
  return (
    <div className="flex flex-col items-center gap-4 bg-white p-6 rounded-xl shadow-inner min-h-[500px]">
      <div className="flex gap-3 mb-4">
        <button onClick={zoomOut} className="px-4 py-2 text-lg bg-gray-600 text-white rounded hover:bg-gray-700">
          -
        </button>
        <button onClick={resetZoom} className="px-4 py-2 text-lg bg-gray-600 text-white rounded hover:bg-gray-700">
          Reset
        </button>
        <button onClick={zoomIn} className="px-4 py-2 text-lg bg-gray-600 text-white rounded hover:bg-gray-700">
          +
        </button>
      </div>
      
      <div className="overflow-auto">
        <canvas ref={canvasRef} className="rounded shadow-md" />
      </div>

      {pdfDoc ? (
        <div className="flex items-center gap-6">
          <button onClick={prev} className="px-6 py-3 text-lg bg-blue-600 text-white rounded hover:bg-blue-700">
            Anterior
          </button>
          <span className="text-gray-700 text-xl font-medium">
            Página {pageNumber} de {totalPages}
          </span>
          <button onClick={next} className="px-6 py-3 text-lg bg-blue-600 text-white rounded hover:bg-blue-700">
            Siguiente
          </button>
        </div>
      ) : (
        <p className="text-gray-400 text-xl font-medium">
          Selecciona un archivo PDF para visualizarlo.
        </p>
      )}
    </div>
  );
};

export default PdfViewerDisplay;
