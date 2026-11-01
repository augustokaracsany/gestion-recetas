export { formatARS, formatARSCompact } from '../utils/currency';

export interface PartnerStore {
  id: string;
  name: string;
  brandColor: string;
  badgeBg: string;
  badgeText: string;
  tagline: string;
  deliveryCost: number; // in ARS
  freeDeliveryThreshold: number; // in ARS
  deliveryTimeEstimate: string;
  minOrderAmount: number;
  rating: number;
  coverageZones: string[];
  coveragePostalCodes: string[]; // List of postal codes or '*' for full country
  addressSample: string;
  // Aliases for convenience
  deliveryFeeARS: number;
  freeDeliveryMinARS: number;
  estimatedDeliveryTime: string;
}

export interface UserLocation {
  city: string;
  zone: string;
  postalCode: string;
  address?: string;
  cityName: string;
  province?: string;
}

export const PRESET_LOCATIONS: UserLocation[] = [
  { city: 'CABA', zone: 'Palermo / Colegiales', cityName: 'CABA (Palermo / Colegiales)', postalCode: '1414', address: 'Av. Santa Fe 3400', province: 'Buenos Aires' },
  { city: 'CABA', zone: 'Belgrano / Núñez', cityName: 'CABA (Belgrano / Núñez)', postalCode: '1428', address: 'Av. Cabildo 2100', province: 'Buenos Aires' },
  { city: 'CABA', zone: 'Recoleta / Centro', cityName: 'CABA (Recoleta / Centro)', postalCode: '1001', address: 'Av. Corrientes 1100', province: 'Buenos Aires' },
  { city: 'Buenos Aires', zone: 'Vicente López / Olivos', cityName: 'Vicente López (Olivos)', postalCode: '1602', address: 'Av. Maipú 1500', province: 'Buenos Aires' },
  { city: 'Buenos Aires', zone: 'San Isidro / Martínez', cityName: 'San Isidro (Martínez)', postalCode: '1642', address: 'Av. Centenario 800', province: 'Buenos Aires' },
  { city: 'Córdoba', zone: 'Córdoba Capital', cityName: 'Córdoba Capital', postalCode: '5000', address: 'Bv. Chacabuco 600', province: 'Córdoba' },
  { city: 'Santa Fe', zone: 'Rosario Centro', cityName: 'Rosario Centro', postalCode: '2000', address: 'Bv. Oroño 900', province: 'Santa Fe' },
  { city: 'Mendoza', zone: 'Mendoza Capital', cityName: 'Mendoza Capital', postalCode: '5500', address: 'Av. San Martín 1200', province: 'Mendoza' },
];

export const PARTNER_STORES: PartnerStore[] = [
  {
    id: 'coto',
    name: 'Coto Digital',
    brandColor: '#dc2626',
    badgeBg: 'bg-red-600',
    badgeText: 'text-white',
    tagline: 'Supermercado líder con catálogo completo de carnes, frescos y almacén',
    deliveryCost: 2850,
    freeDeliveryThreshold: 45000,
    deliveryTimeEstimate: 'Hoy en 2 a 4 hs',
    deliveryFeeARS: 2850,
    freeDeliveryMinARS: 45000,
    estimatedDeliveryTime: 'Hoy en 2 a 4 hs',
    minOrderAmount: 15000,
    rating: 4.8,
    coverageZones: ['CABA', 'GBA Norte', 'GBA Sur', 'GBA Oeste', 'La Plata', 'Rosario'],
    coveragePostalCodes: ['1001', '1414', '1425', '1428', '1602', '1642', '1870', '1900', '2000'],
    addressSample: 'Sucursal Abasto - Av. Corrientes 3247, CABA'
  },
  {
    id: 'jumbo',
    name: 'Jumbo a Casa',
    brandColor: '#059669',
    badgeBg: 'bg-emerald-600',
    badgeText: 'text-white',
    tagline: 'Productos premium, selección gourmet y marcas importadas exclusivas',
    deliveryCost: 3500,
    freeDeliveryThreshold: 55000,
    deliveryTimeEstimate: 'Franja programada mañana 09:00 - 13:00',
    deliveryFeeARS: 3500,
    freeDeliveryMinARS: 55000,
    estimatedDeliveryTime: 'Franja programada mañana 09:00 - 13:00',
    minOrderAmount: 20000,
    rating: 4.9,
    coverageZones: ['CABA', 'GBA Norte', 'Pilar', 'Córdoba Capital'],
    coveragePostalCodes: ['1001', '1414', '1425', '1428', '1602', '1642', '1629', '5000'],
    addressSample: 'Sucursal Palermo - Av. Int. Bullrich 345, CABA'
  },
  {
    id: 'dia',
    name: 'Supermercados Dia',
    brandColor: '#b91c1c',
    badgeBg: 'bg-red-700',
    badgeText: 'text-white',
    tagline: 'Precios accesibles, cercanía y entrega express en barrios urbanos',
    deliveryCost: 1950,
    freeDeliveryThreshold: 30000,
    deliveryTimeEstimate: 'Envío Express en 60 a 90 min',
    deliveryFeeARS: 1950,
    freeDeliveryMinARS: 30000,
    estimatedDeliveryTime: 'Envío Express en 60 a 90 min',
    minOrderAmount: 8000,
    rating: 4.5,
    coverageZones: ['CABA', 'GBA Norte', 'GBA Sur', 'GBA Oeste', 'La Plata', 'Mar del Plata', 'Córdoba', 'Rosario'],
    coveragePostalCodes: ['1001', '1414', '1425', '1428', '1602', '1708', '1870', '1900', '2000', '5000', '7600'],
    addressSample: 'Sucursal Cercanía - Honduras 4100, CABA'
  },
  {
    id: 'meli',
    name: 'Mercado Libre Supermercado',
    brandColor: '#ca8a04',
    badgeBg: 'bg-yellow-400',
    badgeText: 'text-stone-900',
    tagline: 'Envíos Full a todo el país con empaque protegido y seguimiento en vivo',
    deliveryCost: 2600,
    freeDeliveryThreshold: 35000,
    deliveryTimeEstimate: 'Llega mañana con Envíos Full',
    deliveryFeeARS: 2600,
    freeDeliveryMinARS: 35000,
    estimatedDeliveryTime: 'Llega mañana con Envíos Full',
    minOrderAmount: 10000,
    rating: 4.9,
    coverageZones: ['Todo el País', 'CABA', 'GBA', 'Córdoba', 'Rosario', 'Mendoza', 'Mar del Plata'],
    coveragePostalCodes: ['*'], // Nationwide
    addressSample: 'Centro de Distribución Mercado Envíos Full - Mercado Central'
  },
  {
    id: 'vea',
    name: 'Vea Online',
    brandColor: '#d97706',
    badgeBg: 'bg-amber-600',
    badgeText: 'text-white',
    tagline: 'Ahorro familiar cotidiano en almacén, bebidas y lácteos',
    deliveryCost: 2400,
    freeDeliveryThreshold: 40000,
    deliveryTimeEstimate: 'Entrega en 24 horas',
    deliveryFeeARS: 2400,
    freeDeliveryMinARS: 40000,
    estimatedDeliveryTime: 'Entrega en 24 horas',
    minOrderAmount: 12000,
    rating: 4.6,
    coverageZones: ['CABA', 'GBA', 'Mendoza', 'Córdoba', 'Tucumán', 'Salta'],
    coveragePostalCodes: ['1001', '1414', '5000', '5500', '4000', '4400'],
    addressSample: 'Sucursal Mendoza - Av. San Martín 1500, Mendoza'
  },
  {
    id: 'molino_sanjorge',
    name: 'Dietética & Molino San Jorge',
    brandColor: '#835500',
    badgeBg: 'bg-[#835500]',
    badgeText: 'text-white',
    tagline: 'Especialista en harinas agroecológicas, granos a granel y productos Sin TACC certificados',
    deliveryCost: 2200,
    freeDeliveryThreshold: 32000,
    deliveryTimeEstimate: 'Envío especializado 24 a 48 hs',
    deliveryFeeARS: 2200,
    freeDeliveryMinARS: 32000,
    estimatedDeliveryTime: 'Envío especializado 24 a 48 hs',
    minOrderAmount: 6000,
    rating: 4.9,
    coverageZones: ['CABA', 'GBA Norte', 'GBA Sur', 'La Plata', 'Rosario'],
    coveragePostalCodes: ['1001', '1414', '1425', '1428', '1602', '1870', '1900', '2000'],
    addressSample: 'Molino Central - Av. Corrientes 1250, CABA'
  }
];

export const getStoreByName = (storeName: string): PartnerStore => {
  const match = PARTNER_STORES.find(
    (s) => s.name.toLowerCase() === storeName.toLowerCase() || s.id === storeName.toLowerCase()
  );
  return match || PARTNER_STORES[0];
};

export const getStoreById = (storeId: string): PartnerStore | undefined => {
  return PARTNER_STORES.find(
    (s) => s.id === storeId || s.name.toLowerCase() === storeId.toLowerCase()
  );
};

export const checkStoreCoverage = (store: PartnerStore, postalCode: string): boolean => {
  if (store.coveragePostalCodes.includes('*')) return true;
  return store.coveragePostalCodes.some((cp) => postalCode.startsWith(cp) || cp.startsWith(postalCode));
};
