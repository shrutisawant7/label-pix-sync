import { useState, useEffect } from 'react';
import { ImageCard } from './ImageCard';
import { ImageModal } from './ImageModal';
import { GoogleSheetsSetup } from './GoogleSheetsSetup';
import { Loader2, Upload, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export interface ImageData {
  id: string;
  url: string;
  label: string;
  comments?: string;
}

interface ImageGalleryProps {
  images: ImageData[];
  onUpdateLabel: (id: string, newLabel: string) => Promise<void>;
  onUpdateComments: (id: string, newComments: string) => Promise<void>;
  onRefresh: () => Promise<void>;
  loading?: boolean;
}

export function ImageGallery({ images, onUpdateLabel, onUpdateComments, onRefresh, loading = false }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
      toast({
        title: "Refreshed successfully",
        description: "Gallery data has been updated from Google Sheets.",
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Could not update gallery data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gallery-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading your image gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gallery-bg">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gallery-bg/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-3">
              <GoogleSheetsSetup onConfigured={handleRefresh} />
              <Button 
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="container mx-auto px-4 py-8">
        {images.length === 0 ? (
          <div className="text-center py-20">
            <Upload className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No images found</h3>
            <p className="text-muted-foreground">
              Add image URLs and labels to your Google Sheet to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                onImageClick={() => setSelectedImage(image)}
                onLabelUpdate={onUpdateLabel}
                onCommentsUpdate={onUpdateComments}
              />
            ))}
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          image={selectedImage}
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          onLabelUpdate={onUpdateLabel}
          onCommentsUpdate={onUpdateComments}
        />
      )}
    </div>
  );
}