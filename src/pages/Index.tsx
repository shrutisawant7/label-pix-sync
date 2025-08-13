import { useState, useEffect } from 'react';
import { ImageGallery, ImageData } from '@/components/ImageGallery';
import { googleSheetsService } from '@/services/googleSheets';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadImages = async () => {
    try {
      setLoading(true);
      const fetchedImages = await googleSheetsService.fetchImages();
      setImages(fetchedImages);
    } catch (error) {
      toast({
        title: "Failed to load images",
        description: "Could not load images from your data source. Using demo data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLabel = async (id: string, newLabel: string) => {
    try {
      await googleSheetsService.updateImageLabel(id, newLabel);
      setImages(prev => 
        prev.map(img => 
          img.id === id ? { ...img, label: newLabel } : img
        )
      );
    } catch (error) {
      throw new Error('Failed to update label');
    }
  };

  const handleRefresh = async () => {
    await loadImages();
  };

  useEffect(() => {
    loadImages();
  }, []);

  return (
    <ImageGallery
      images={images}
      onUpdateLabel={handleUpdateLabel}
      onRefresh={handleRefresh}
      loading={loading}
    />
  );
};

export default Index;
