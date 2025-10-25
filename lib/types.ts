export interface GridItem {
  id: number;
  title: string;
  category: string;
  image: string;
  height: number;
  blurHash: string;
}

export interface CalculatedPosition {
  item: GridItem;
  x: number;
  y: number;
  width: number;
  height: number;
}
