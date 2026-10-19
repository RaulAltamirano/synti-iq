export interface ProductFilterDto {
  name?: string;
  sku?: string;
  barcode?: string;
  brand?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minProfitMargin?: number;
  isPerishable?: boolean;
  salesRankMin?: number;
  tags?: string[];
  orderBy?: 'name' | 'createdAt' | 'sellingPrice' | 'salesRank' | 'profitMargin';
  orderDirection?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}
