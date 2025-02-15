export type ShapeType = 'plus' | 'L' | 'T' | 'rectangle' | 'hline';

export interface ShapeDefinition {
  type: ShapeType;
  // Offsets relative to a chosen top-left.
  offsets: { row: number; col: number }[];
}

export const shapeDefinitions: ShapeDefinition[] = [
  { type: 'plus', offsets: [ {row:0, col:1}, {row:1, col:0}, {row:1, col:1}, {row:1, col:2}, {row:2, col:1} ] },
  { type: 'L', offsets: [ {row:0, col:0}, {row:1, col:0}, {row:2, col:0}, {row:2, col:1} ] },
  { type: 'T', offsets: [ {row:0, col:0}, {row:0, col:1}, {row:0, col:2}, {row:1, col:1} ] },
  { type: 'rectangle', offsets: [ {row:0, col:0}, {row:0, col:1}, {row:1, col:0}, {row:1, col:1} ] },
  { type: 'hline', offsets: [ {row:0, col:0}, {row:0, col:1}, {row:0, col:2}, {row:0, col:3} ] },
];
