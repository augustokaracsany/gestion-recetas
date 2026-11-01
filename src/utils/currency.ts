/**
 * Utilidades para formateo de moneda y localización de Pesos Argentinos ($ ARS).
 * Cumple con formato estándar argentino: punto como separador de miles,
 * coma como separador de decimales y sufijo explícito 'ARS' (ej: $ 3.500,00 ARS).
 */

export const formatARS = (amount: number): string => {
  const safeAmount = isNaN(amount) ? 0 : amount;
  const formattedNumber = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeAmount);

  return `$ ${formattedNumber} ARS`;
};

export const formatARSCompact = (amount: number): string => {
  const safeAmount = isNaN(amount) ? 0 : amount;
  const formattedNumber = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(safeAmount);

  return `$ ${formattedNumber} ARS`;
};
