import { getDocument } from 'pdfjs-dist';

export const extractPdfData = async (buffer) => {
  try {
    const { promise } = getDocument({ data: buffer });
    const pdf = await promise;
    const numPages = pdf.numPages;
    let text = '';
    
    // Extraer texto de todas las páginas
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(item => item.str).join(' ');
    }
    
    // Expresiones regulares para extraer datos
    const rutRegex = /\b\d{1,2}\.\d{3}\.\d{3}[-][0-9kK]\b/g;
    const dateRegex = /\b\d{2}[-/]\d{2}[-/]\d{4}\b/g;
    const nameRegex = /[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+ [A-ZÁÉÍÓÚÑ][a-záéíóúñ]+/g;
    
    // Extraer datos
    const data = {
      ruts: [...new Set(text.match(rutRegex) || [])],
      dates: [...new Set(text.match(dateRegex) || [])],
      names: [...new Set(text.match(nameRegex) || [])],
      fileName: pdf._transport.source.url.split('/').pop(),
      pageCount: numPages
    };
    
    return data;
  } catch (error) {
    console.error('Error al extraer datos del PDF:', error);
    throw error;
  }
};

export const generateCSV = (pdfDataArray) => {
  // Cabeceras del CSV
  const headers = ['Nombre Archivo', 'Páginas', 'RUTs', 'Fechas', 'Nombres'];
  
  // Convertir datos a filas CSV
  const rows = pdfDataArray.map(data => [
    data.fileName,
    data.pageCount,
    data.ruts.join('; '),
    data.dates.join('; '),
    data.names.join('; ')
  ]);
  
  // Combinar cabeceras y filas
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  return csvContent;
}; 