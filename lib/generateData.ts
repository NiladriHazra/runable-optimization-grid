import { GridItem } from './types';

/**
 * Data generator for creating large datasets
 * Generates up to 15,000 items with varied images and heights
 */

const images = [
  {
    path: '/image.png',
    height: 240,
    blurHash: 'L6PZfSjE.AyE_3t7t7R**0o#DgR4',
  },
  {
    path: '/image copy 2.png',
    height: 300,
    blurHash: 'LGQ0fW~q_3IU%Mt7t7xu~qM{M{xu',
  },
  {
    path: '/image copy 3.png',
    height: 380,
    blurHash: 'LIQ0fW~q_3IU%Mt7t7xu~qM{M{xu',
  },
  {
    path: '/image copy 4.png',
    height: 240,
    blurHash: 'L03cJ~D%009F00IU-;WB~q%M-;WB',
  },
  {
    path: '/image copy.png',
    height: 480,
    blurHash: 'LNQ0fW~q_3IU%Mt7t7xu~qM{M{xu',
  },
];

const categories = [
  'Design',
  'Website',
  'Video',
  'Document',
  'Presentation',
  'Branding',
  'Marketing',
  'Development',
];

const titles = [
  'Pitch Deck',
  'Website Migration',
  'Fitness Journey',
  'Business Pitch',
  'Music Performance',
  'Workflow Design',
  'Action Shot',
  'Business Opportunity',
  'Creative Portfolio',
  'Brand Identity',
  'Product Launch',
  'Design System',
  'Mobile App',
  'E-commerce Platform',
  'Dashboard UI',
  'Marketing Campaign',
  'Social Media Kit',
  'Video Production',
  'Annual Report',
  'Brand Strategy',
];

/**
 * Generate sample data items
 * @param count - Number of items to generate
 * @returns Array of GridItem objects
 */
export function generateSampleData(count: number): GridItem[] {
  const items: GridItem[] = [];

  for (let i = 0; i < count; i++) {
    const imageData = images[i % images.length];
    const title = titles[i % titles.length];
    const category = categories[i % categories.length];

    items.push({
      id: i + 1,
      title: `${title} ${Math.floor(i / titles.length) + 1}`,
      category,
      image: imageData.path,
      height: imageData.height,
      blurHash: imageData.blurHash,
    });
  }

  return items;
}

/**
 * Generate data in chunks for progressive loading
 * @param startIndex - Starting index
 * @param count - Number of items to generate
 * @returns Array of GridItem objects
 */
export function generateDataChunk(startIndex: number, count: number): GridItem[] {
  const items: GridItem[] = [];

  for (let i = startIndex; i < startIndex + count; i++) {
    const imageData = images[i % images.length];
    const title = titles[i % titles.length];
    const category = categories[i % categories.length];

    items.push({
      id: i + 1,
      title: `${title} ${Math.floor(i / titles.length) + 1}`,
      category,
      image: imageData.path,
      height: imageData.height,
      blurHash: imageData.blurHash,
    });
  }

  return items;
}
