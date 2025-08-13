import { ImageData } from '@/components/ImageGallery';

// Google Sheets CSV API endpoint (read-only)
// Users will need to publish their sheet to web and get the CSV URL
const DEMO_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSample/pub?output=csv';

// For demo purposes, we'll use local storage and mock data
const STORAGE_KEY = 'image_gallery_data';

// Mock data for demonstration
const DEMO_IMAGES: ImageData[] = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop',
    label: 'Mountain Landscape'
  },
  {
    id: '2', 
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=800&fit=crop',
    label: 'Forest Path'
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop&auto=format&q=80',
    label: 'Ocean Sunset'
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=800&fit=crop',
    label: 'Desert Dunes'
  },
  {
    id: '5',
    url: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=800&fit=crop',
    label: 'Tropical Beach'
  },
  {
    id: '6',
    url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&h=800&fit=crop',
    label: 'Rolling Hills'
  }
];

interface GoogleSheetsConfig {
  sheetUrl?: string;
  useMockData?: boolean;
}

class GoogleSheetsService {
  private config: GoogleSheetsConfig;

  constructor(config: GoogleSheetsConfig = {}) {
    this.config = {
      useMockData: true,
      ...config
    };
  }

  // Initialize data (first load)
  async initializeData(): Promise<ImageData[]> {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Failed to parse stored data:', error);
      }
    }

    // Use demo data for first time
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_IMAGES));
    return DEMO_IMAGES;
  }

  // Fetch images from Google Sheets
  async fetchImages(): Promise<ImageData[]> {
    if (this.config.useMockData) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      return this.initializeData();
    }

    try {
      if (!this.config.sheetUrl) {
        throw new Error('Google Sheets URL not configured');
      }

      const response = await fetch(this.config.sheetUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const csvText = await response.text();
      return this.parseCSV(csvText);
    } catch (error) {
      console.error('Failed to fetch from Google Sheets:', error);
      // Fallback to stored data
      return this.initializeData();
    }
  }

  // Update image label
  async updateImageLabel(id: string, newLabel: string): Promise<void> {
    const images = await this.initializeData();
    const imageIndex = images.findIndex(img => img.id === id);
    
    if (imageIndex === -1) {
      throw new Error('Image not found');
    }

    images[imageIndex].label = newLabel;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(images));

    // In a real implementation, this would update the Google Sheet via API
    // For now, we'll simulate the API call
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Add new image
  async addImage(url: string, label: string): Promise<ImageData> {
    const images = await this.initializeData();
    const newImage: ImageData = {
      id: Date.now().toString(),
      url,
      label
    };

    images.push(newImage);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(images));

    return newImage;
  }

  // Delete image
  async deleteImage(id: string): Promise<void> {
    const images = await this.initializeData();
    const filteredImages = images.filter(img => img.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredImages));
  }

  // Parse CSV data from Google Sheets
  private parseCSV(csvText: string): ImageData[] {
    const lines = csvText.split('\n');
    const images: ImageData[] = [];

    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const [id, url, label] = line.split(',').map(cell => 
        cell.replace(/^"/, '').replace(/"$/, '').trim()
      );

      if (url && url.startsWith('http')) {
        images.push({
          id: id || i.toString(),
          url,
          label: label || 'Untitled'
        });
      }
    }

    return images;
  }

  // Configure Google Sheets URL
  setSheetUrl(url: string) {
    this.config.sheetUrl = url;
    this.config.useMockData = false;
  }

  // Reset to demo mode
  resetToDemo() {
    this.config.useMockData = true;
    localStorage.removeItem(STORAGE_KEY);
  }
}

// Export singleton instance
export const googleSheetsService = new GoogleSheetsService();
export type { ImageData };