import mammoth from 'mammoth';

export const extractDocxContent = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        if (!arrayBuffer) {
          throw new Error('Failed to read file as ArrayBuffer');
        }
        
        // mammoth.convertToHtml takes an array buffer
        const result = await mammoth.convertToHtml({ arrayBuffer });
        resolve(result.value); // The generated HTML
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsArrayBuffer(file);
  });
};
