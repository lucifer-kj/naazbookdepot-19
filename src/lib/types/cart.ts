
import { Product } from "@/components/product/ProductDisplay";

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    sale_price: number | null;
    quantity_in_stock: number;
    main_image_url: string | null;
  };
}

export interface CartSummary {
  subtotal: number;
  itemCount: number;
  items: CartItem[];
}

export interface AddToCartInput {
  productId: string;
  quantity?: number;
}
