import { google } from 'googleapis';

const SHAREPOINT_SITE = 'https://rrhh1313.sharepoint.com/sites/VisorPDF';
const LIBRARY_NAME = 'SiteAssets';

class SharePointService {
  constructor() {
    this.isAuthenticated = false;
    this.initialize();
  }

  async initialize() {
    try {
      await this.getAuth();
    } catch (error) {
      console.error('Error al inicializar SharePoint:', error);
      throw new Error('No se pudo inicializar el servicio de SharePoint');
    }
  }

  async getAuth() {
    try {
      const response = await fetch(`${SHAREPOINT_SITE}/_api/contextinfo`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json;odata=verbose',
          'Content-Type': 'application/json;odata=verbose',
          'Origin': window.location.origin
        },
        credentials: 'include',
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`Error de autenticación con SharePoint: ${response.statusText}`);
      }

      const data = await response.json();
      this.formDigestValue = data.d.GetContextWebInformation.FormDigestValue;
      this.isAuthenticated = true;
      return true;
    } catch (error) {
      console.error('Error de autenticación:', error);
      this.isAuthenticated = false;
      throw error;
    }
  }

  async uploadPDF(file, fileName) {
    if (!this.isAuthenticated) {
      await this.getAuth();
    }

    try {
      // Convertir el archivo a ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      const response = await fetch(
        `${SHAREPOINT_SITE}/_api/web/lists/getbytitle('${LIBRARY_NAME}')/rootfolder/files/add(url='${fileName}',overwrite=true)`,
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json;odata=verbose',
            'X-RequestDigest': this.formDigestValue,
            'Content-Type': 'application/pdf',
            'Origin': window.location.origin
          },
          credentials: 'include',
          mode: 'cors',
          body: arrayBuffer
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Error al subir archivo: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        fileUrl: result.d.ServerRelativeUrl,
        fileName: fileName
      };
    } catch (error) {
      console.error('Error al subir PDF a SharePoint:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getPDFList() {
    if (!this.isAuthenticated) {
      await this.getAuth();
    }

    try {
      const response = await fetch(
        `${SHAREPOINT_SITE}/_api/web/lists/getbytitle('${LIBRARY_NAME}')/items?$select=Title,FileLeafRef,FileRef&$filter=endswith(FileLeafRef, '.pdf')`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json;odata=verbose',
            'Origin': window.location.origin
          },
          credentials: 'include',
          mode: 'cors'
        }
      );

      if (!response.ok) {
        throw new Error(`Error al obtener lista: ${response.statusText}`);
      }

      const data = await response.json();
      return data.d.results.map(item => ({
        name: item.FileLeafRef,
        url: item.FileRef
      }));
    } catch (error) {
      console.error('Error al obtener lista de PDFs:', error);
      throw error;
    }
  }
}

export const sharePointService = new SharePointService(); 