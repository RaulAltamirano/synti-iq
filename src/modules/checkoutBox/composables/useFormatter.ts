const priceFormatter = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const useFormatter = () => {
  const formatPrice = (price: number): string => priceFormatter.format(price);

  return { formatPrice };
};
