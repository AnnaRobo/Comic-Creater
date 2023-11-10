import React, { useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

function ImageToPdf({ imageUrls }) {
  const pdfRef = useRef();

  const handleExportToPdf = () => {
    const pdf = new jsPDF();

    // Loop through each image URL
    imageUrls.forEach((imageUrl, index) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // Add the canvas to the PDF
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 10, 180, 120);

        // Add a new page for the next image (if not the last image)
        if (index < imageUrls.length - 1) {
          pdf.addPage();
        }

        // Save or export the PDF after processing all images
        if (index === imageUrls.length - 1) {
          pdf.save('images.pdf');
        }
      };

      img.src = imageUrl;
    });
  };

  return (
    <div>
      {/* Render your images here */}
      {imageUrls.map((imageUrl, index) => (
        <img key={index} src={imageUrl} alt={`Image ${index + 1}`} style={{ maxWidth: '100%', marginBottom: '10px' }} />
      ))}

      {/* Button to export to PDF */}
      <button onClick={handleExportToPdf}>Export to PDF</button>

      {/* Ref for hidden PDF container */}
      <div style={{ display: 'none' }} ref={pdfRef}></div>
    </div>
  );
}

export default ImageToPdf;
