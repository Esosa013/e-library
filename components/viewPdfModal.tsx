import { useState, useEffect } from 'react';
import { Download, ZoomIn, ZoomOut, RotateCw, X } from 'lucide-react';
import { Modal, Box } from '@mui/material';
import { Button } from "@/components/ui/button";

interface ViewPdfModalProps {
  selectedPdf: string | null;
  setSelectedPdf: (pdf: string | null) => void;
}

const ViewPdfModal = ({ selectedPdf, setSelectedPdf }: ViewPdfModalProps) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedPdf) {
      const checkPdfExists = async () => {
        try {
          const response = await fetch(selectedPdf);
          if (!response.ok) {
            throw new Error('PDF not found');
          }
          if (!response.headers.get('content-type')?.includes('application/pdf')) {
            throw new Error('Invalid file format');
          }
          setError(null);
        } catch (err) {
          setError('Unable to load PDF. The file might be corrupted or not found.');
        }
      };
      checkPdfExists();
    }
  }, [selectedPdf]);

  return (
    <Modal
      open={!!selectedPdf}
      onClose={() => {
        setSelectedPdf(null);
        setError(null);
      }}
      aria-labelledby="pdf-viewer"
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        height: '90%',
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: 2,
      }}>
        <div className="h-full w-full flex flex-col">
          <div className="flex justify-between items-center mb-4 bg-gray-800 p-2 rounded">
            <div className="flex gap-2">
              <Button 
                onClick={() => setZoom(prev => Math.min(prev + 0.2, 2))}
                className="bg-gray-700 hover:bg-gray-600"
                disabled={!!error}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button 
                onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.5))}
                className="bg-gray-700 hover:bg-gray-600"
                disabled={!!error}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button 
                onClick={() => setRotation(prev => (prev + 90) % 360)}
                className="bg-gray-700 hover:bg-gray-600"
                disabled={!!error}
              >
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button 
                onClick={() => window.open(selectedPdf as string, '_blank')}
                className="bg-gray-700 hover:bg-gray-600"
                disabled={!!error}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              onClick={() => {
                setZoom(1);
                setRotation(0);
                setSelectedPdf(null);
                setError(null);
              }}
              className="bg-gray-700 hover:bg-gray-600"
            >
                <X className="h-4 w-4"/>
            </Button>
          </div>
          
          {error ? (
            <div className="bg-red-900 border border-red-500 text-red-200 p-4 rounded-md">
              {error}
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              <iframe
                src={selectedPdf ? `${selectedPdf}#toolbar=0` : ''}
                className="w-full h-full"
                title="PDF Viewer"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.2s ease-in-out'
                }}
              />
            </div>
          )}
        </div>
      </Box>
    </Modal>
  );
};

export default ViewPdfModal;