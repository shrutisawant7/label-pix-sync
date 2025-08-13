import { useState } from 'react';
import { Edit2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ImageData } from './ImageGallery';

interface ImageCardProps {
  image: ImageData;
  onImageClick: () => void;
  onLabelUpdate: (id: string, newLabel: string) => Promise<void>;
}

export function ImageCard({ image, onImageClick, onLabelUpdate }: ImageCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedLabel, setEditedLabel] = useState(image.label);
  const [isUpdating, setIsUpdating] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { toast } = useToast();

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
      setEditedLabel(image.label); // Reset to original
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditedLabel(image.label);
    setIsEditing(false);
  };

  const handleLabelDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  return (
    <div className="group relative bg-gallery-card rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[var(--gallery-shadow-hover)] hover:scale-[1.02]">
      {/* Image Container */}
      <div 
        className="aspect-square overflow-hidden cursor-pointer relative"
        onClick={onImageClick}
      >
        {!imageLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <img
          src={image.url}
          alt={image.label}
          className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(true)}
        />
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Zoom indicator */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        </div>
      </div>

      {/* Label Section */}
      <div className="p-4">
        {isEditing ? (
          <div className="space-y-3">
            <Input
              value={editedLabel}
              onChange={(e) => setEditedLabel(e.target.value)}
              placeholder="Enter image label..."
              className="text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') handleCancel();
              }}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isUpdating}
                className="flex-1"
              >
                {isUpdating ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-3 h-3 mr-1" />
                )}
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={isUpdating}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div 
            className="flex items-center justify-between group/label cursor-pointer"
            onDoubleClick={handleLabelDoubleClick}
          >
            <p className="text-sm font-medium text-card-foreground group-hover/label:text-primary transition-colors">
              {image.label || 'Untitled'}
            </p>
            <Edit2 className="w-3 h-3 text-muted-foreground opacity-0 group-hover/label:opacity-100 transition-opacity" />
          </div>
        )}
      </div>
    </div>
  );
}