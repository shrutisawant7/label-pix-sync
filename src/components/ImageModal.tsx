import { useState, useEffect } from 'react';
import { X, Edit2, Save, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ImageData } from './ImageGallery';

interface ImageModalProps {
  image: ImageData;
  isOpen: boolean;
  onClose: () => void;
  onLabelUpdate: (id: string, newLabel: string) => Promise<void>;
}

export function ImageModal({ image, isOpen, onClose, onLabelUpdate }: ImageModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedLabel, setEditedLabel] = useState(image.label);
  const [isUpdating, setIsUpdating] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setEditedLabel(image.label);
      setImageLoaded(false);
    }
  }, [image.label, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isEditing) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, isEditing, onClose]);

  const handleSave = async () => {
    if (editedLabel.trim() === image.label) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      await onLabelUpdate(image.id, editedLabel.trim());
      setIsEditing(false);
      toast({
        title: "Label updated",
        description: "The image label has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Could not update the label. Please try again.",
        variant: "destructive",
      });
      setEditedLabel(image.label);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditedLabel(image.label);
    setIsEditing(false);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = image.label || 'image';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    window.open(image.url, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <div className="relative bg-black">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </Button>
                <div className="text-white">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editedLabel}
                        onChange={(e) => setEditedLabel(e.target.value)}
                        placeholder="Enter image label..."
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSave();
                          if (e.key === 'Escape') handleCancel();
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={isUpdating}
                        className="bg-primary hover:bg-primary-hover"
                      >
                        {isUpdating ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isUpdating}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{image.label || 'Untitled'}</h3>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsEditing(true)}
                        className="text-white/80 hover:text-white hover:bg-white/20"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDownload}
                  className="text-white hover:bg-white/20"
                  title="Download image"
                >
                  <Download className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleOpenInNewTab}
                  className="text-white hover:bg-white/20"
                  title="Open in new tab"
                >
                  <ExternalLink className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative flex items-center justify-center min-h-[60vh] max-h-[80vh]">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <img
              src={image.url}
              alt={image.label}
              className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(true)}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}