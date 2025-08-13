import { useState, useEffect } from 'react';
import { X, Edit2, Save, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ImageData } from './ImageGallery';

interface ImageModalProps {
  image: ImageData;
  isOpen: boolean;
  onClose: () => void;
  onLabelUpdate: (id: string, newLabel: string) => Promise<void>;
  onCommentsUpdate: (id: string, newComments: string) => Promise<void>;
}

export function ImageModal({ image, isOpen, onClose, onLabelUpdate, onCommentsUpdate }: ImageModalProps) {
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [isEditingComments, setIsEditingComments] = useState(false);
  const [editedLabel, setEditedLabel] = useState(image.label);
  const [editedComments, setEditedComments] = useState(image.comments || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setEditedLabel(image.label);
      setEditedComments(image.comments || '');
      setImageLoaded(false);
    }
  }, [image.label, image.comments, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isEditingLabel && !isEditingComments) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, isEditingLabel, isEditingComments, onClose]);

  const handleSaveLabel = async () => {
    if (editedLabel.trim() === image.label) {
      setIsEditingLabel(false);
      return;
    }

    setIsUpdating(true);
    try {
      await onLabelUpdate(image.id, editedLabel.trim());
      setIsEditingLabel(false);
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

  const handleSaveComments = async () => {
    if (editedComments.trim() === (image.comments || '')) {
      setIsEditingComments(false);
      return;
    }

    setIsUpdating(true);
    try {
      await onCommentsUpdate(image.id, editedComments.trim());
      setIsEditingComments(false);
      toast({
        title: "Comments updated",
        description: "The image comments have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Could not update the comments. Please try again.",
        variant: "destructive",
      });
      setEditedComments(image.comments || '');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelLabel = () => {
    setEditedLabel(image.label);
    setIsEditingLabel(false);
  };

  const handleCancelComments = () => {
    setEditedComments(image.comments || '');
    setIsEditingComments(false);
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
                  <h3 className="text-lg font-semibold">{image.label || 'Untitled'}</h3>
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

          {/* Bottom Panel */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
            <div className="space-y-4">
              {/* Label */}
              <div>
                <Label className="text-xs text-white/60 mb-1 block">Label</Label>
                {isEditingLabel ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editedLabel}
                      onChange={(e) => setEditedLabel(e.target.value)}
                      placeholder="Enter image label..."
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60 flex-1"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveLabel();
                        if (e.key === 'Escape') handleCancelLabel();
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={handleSaveLabel}
                      disabled={isUpdating}
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
                      onClick={handleCancelLabel}
                      disabled={isUpdating}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="flex items-center justify-between bg-white/10 rounded p-2 cursor-pointer hover:bg-white/20 transition-colors"
                    onClick={() => setIsEditingLabel(true)}
                  >
                    <span className="text-white text-sm">{image.label || 'Click to add label'}</span>
                    <Edit2 className="w-4 h-4 text-white/60" />
                  </div>
                )}
              </div>

              {/* Comments */}
              <div>
                <Label className="text-xs text-white/60 mb-1 block">Comments</Label>
                {isEditingComments ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editedComments}
                      onChange={(e) => setEditedComments(e.target.value)}
                      placeholder="Enter comments..."
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60 min-h-[60px]"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') handleCancelComments();
                      }}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSaveComments}
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
                        onClick={handleCancelComments}
                        disabled={isUpdating}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="bg-white/10 rounded p-2 cursor-pointer hover:bg-white/20 transition-colors min-h-[60px] flex items-start justify-between"
                    onClick={() => setIsEditingComments(true)}
                  >
                    <span className="text-white text-sm flex-1">{image.comments || 'Click to add comments'}</span>
                    <Edit2 className="w-4 h-4 text-white/60 mt-0.5" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}