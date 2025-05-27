
export interface Image {
  id: number | string;
  src: string;
  alt?: string;
}

export interface Category {
  id: string | number;
  name: string;
  slug: string;
  description?: string;
  count?: number;
  image?: Image;
  parent?: {
    id: string | number;
    name: string;
    slug: string;
  };
  children?: Category[];
}

export interface Product {
  id: string | number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: string;
  regular_price: string;
  sale_price: string | null;
  on_sale: boolean;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  quantity_in_stock: number;
  sku?: string;
  categories: Category[];
  images: Image[];
  related_ids?: (string | number)[];
  average_rating?: string;
  rating_count?: number;
  is_featured?: boolean;
}
