import { useState } from 'react';
import { Settings, ExternalLink, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { googleSheetsService } from '@/services/googleSheets';

interface GoogleSheetsSetupProps {
  onConfigured?: () => void;
}

export function GoogleSheetsSetup({ onConfigured }: GoogleSheetsSetupProps) {
  const [sheetUrl, setSheetUrl] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const sampleSheetUrl = 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0';
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sheetUrl.trim()) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Google Sheets URL.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Convert edit URL to CSV URL
      const csvUrl = convertToCSVUrl(sheetUrl);
      googleSheetsService.setSheetUrl(csvUrl);
      
      toast({
        title: "Configuration saved",
        description: "Google Sheets URL has been configured successfully.",
      });
      
      setIsOpen(false);
      onConfigured?.();
    } catch (error) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Google Sheets URL.",
        variant: "destructive",
      });
    }
  };

  const convertToCSVUrl = (url: string): string => {
    // Extract sheet ID from various Google Sheets URL formats
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      throw new Error('Invalid Google Sheets URL');
    }
    
    const sheetId = match[1];
    return `https://docs.google.com/spreadsheets/d/e/${sheetId}/pub?output=csv`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied to clipboard",
        description: "Template has been copied successfully.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleUseDemo = () => {
    googleSheetsService.resetToDemo();
    toast({
      title: "Demo mode enabled",
      description: "Using demo images. You can edit labels and they'll be saved locally.",
    });
    setIsOpen(false);
    onConfigured?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Configure Sheets
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Connect to Google Sheets</DialogTitle>
          <DialogDescription>
            Connect your image gallery to a Google Sheet to manage your images and labels.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Setup Instructions</CardTitle>
              <CardDescription>
                Follow these steps to connect your Google Sheet:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <p className="text-sm font-medium">1. Create a Google Sheet with this format:</p>
                <div className="bg-muted p-3 rounded-md font-mono text-sm">
                  <div className="grid grid-cols-3 gap-4 mb-2 font-semibold">
                    <span>ID</span>
                    <span>URL</span>
                    <span>Label</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-muted-foreground">
                    <span>1</span>
                    <span>https://example.com/image1.jpg</span>
                    <span>Beautiful Sunset</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-muted-foreground">
                    <span>2</span>
                    <span>https://example.com/image2.jpg</span>
                    <span>Mountain View</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard("ID,URL,Label\n1,https://example.com/image1.jpg,Beautiful Sunset\n2,https://example.com/image2.jpg,Mountain View")}
                  className="w-full"
                >
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  Copy Template CSV
                </Button>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">2. Publish your sheet to the web:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• File → Share → Publish to web</li>
                  <li>• Choose "Entire Document" and "Web page"</li>
                  <li>• Click "Publish" and copy the URL</li>
                </ul>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://docs.google.com/spreadsheets/', '_blank')}
                className="w-full"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Google Sheets
              </Button>
            </CardContent>
          </Card>

          {/* URL Input */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sheet-url">Google Sheets URL</Label>
              <Input
                id="sheet-url"
                type="url"
                placeholder={sampleSheetUrl}
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Paste the URL of your published Google Sheet
              </p>
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="flex-1">
                Connect Sheet
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleUseDemo}
                className="flex-1"
              >
                Use Demo Data
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}