export const FLAVORS = [
  { id: 'vanilla', name: 'Vanilla', color: '#FFF1CC', dots: '#E9D29A' },
  { id: 'chocolate', name: 'Chocolate', color: '#7B4B2A', dark: true },
  { id: 'strawberry', name: 'Strawberry', color: '#FF9EB5', dots: '#E0476B' },
  { id: 'mint', name: 'Mint Chip', color: '#A8F0D1', dots: '#3B2314' },
  { id: 'cookie', name: 'Cookie Dough', color: '#F5E1B8', dots: '#6B4423' },
  { id: 'cotton', name: 'Cotton Candy', color: '#C9B6FF', dots: '#7FD3FF' },
  { id: 'blueberry', name: 'Blueberry', color: '#8FB3FF', dots: '#3D4FB8' },
  { id: 'mango', name: 'Mango', color: '#FFC94D' },
  { id: 'birthday', name: 'Birthday Cake', color: '#FFF4FA', sprinkles: true },
  { id: 'orange', name: 'Orange Sherbet', color: '#FFB07A', dots: '#FFE0C2' },
  { id: 'pistachio', name: 'Pistachio', color: '#C6E3A0', dots: '#7FA34E' },
  { id: 'rocky', name: 'Rocky Road', color: '#8A5A3C', dots: '#FFFFFF', dark: true },
];

export const FLAVORS_BY_ID = Object.fromEntries(FLAVORS.map((f) => [f.id, f]));

export function randomFlavorId() {
  return FLAVORS[Math.floor(Math.random() * FLAVORS.length)].id;
}
