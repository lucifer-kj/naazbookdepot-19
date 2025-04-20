
interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  nonInteraction?: boolean;
}

interface EcommerceProduct {
  id: string;
  name: string;
  price: number;
  brand?: string;
  category?: string;
  variant?: string;
  quantity?: number;
}

interface EcommerceAction {
  id?: string;
  affiliation?: string;
  revenue?: number;
  tax?: number;
  shipping?: number;
  coupon?: string;
}

// Initialize Google Analytics
export function initializeAnalytics(measurementId: string): void {
  // Add Google Analytics script tag
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', measurementId, {
    send_page_view: false // We'll manage page views manually
  });

  // Make gtag globally available
  window.gtag = gtag;
}

// Track page view
export function trackPageView(path: string, title?: string): void {
  if (!window.gtag) return;

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
    page_location: window.location.href
  });
}

// Track custom event
export function trackEvent(event: AnalyticsEvent): void {
  if (!window.gtag) return;

  window.gtag('event', event.action, {
    event_category: event.category,
    event_label: event.label,
    value: event.value,
    non_interaction: event.nonInteraction
  });
}

// E-commerce: Track product impressions
export function trackProductImpressions(products: EcommerceProduct[], listName?: string): void {
  if (!window.gtag) return;

  window.gtag('event', 'view_item_list', {
    items: products.map((product, index) => ({
      item_id: product.id,
      item_name: product.name,
      price: product.price,
      item_brand: product.brand,
      item_category: product.category,
      item_variant: product.variant,
      index
    })),
    item_list_name: listName
  });
}

// E-commerce: Track product detail view
export function trackProductView(product: EcommerceProduct): void {
  if (!window.gtag) return;

  window.gtag('event', 'view_item', {
    items: [{
      item_id: product.id,
      item_name: product.name,
      price: product.price,
      item_brand: product.brand,
      item_category: product.category,
      item_variant: product.variant,
    }]
  });
}

// E-commerce: Track add to cart
export function trackAddToCart(product: EcommerceProduct): void {
  if (!window.gtag) return;

  window.gtag('event', 'add_to_cart', {
    items: [{
      item_id: product.id,
      item_name: product.name,
      price: product.price,
      item_brand: product.brand,
      item_category: product.category,
      item_variant: product.variant,
      quantity: product.quantity || 1
    }]
  });
}

// E-commerce: Track remove from cart
export function trackRemoveFromCart(product: EcommerceProduct): void {
  if (!window.gtag) return;

  window.gtag('event', 'remove_from_cart', {
    items: [{
      item_id: product.id,
      item_name: product.name,
      price: product.price,
      item_brand: product.brand,
      item_category: product.category,
      item_variant: product.variant,
      quantity: product.quantity || 1
    }]
  });
}

// E-commerce: Track checkout
export function trackBeginCheckout(products: EcommerceProduct[], action?: EcommerceAction): void {
  if (!window.gtag) return;

  window.gtag('event', 'begin_checkout', {
    items: products.map(product => ({
      item_id: product.id,
      item_name: product.name,
      price: product.price,
      item_brand: product.brand,
      item_category: product.category,
      item_variant: product.variant,
      quantity: product.quantity || 1
    })),
    coupon: action?.coupon
  });
}

// E-commerce: Track purchase
export function trackPurchase(
  products: EcommerceProduct[], 
  action: EcommerceAction
): void {
  if (!window.gtag) return;

  window.gtag('event', 'purchase', {
    transaction_id: action.id,
    value: action.revenue,
    currency: 'INR',
    tax: action.tax,
    shipping: action.shipping,
    items: products.map(product => ({
      item_id: product.id,
      item_name: product.name,
      price: product.price,
      item_brand: product.brand,
      item_category: product.category,
      item_variant: product.variant,
      quantity: product.quantity || 1
    }))
  });
}

// Analytics: Track user authentication
export function trackLogin(method: string): void {
  if (!window.gtag) return;

  window.gtag('event', 'login', {
    method
  });
}

// Analytics: Track search
export function trackSearch(searchTerm: string): void {
  if (!window.gtag) return;

  window.gtag('event', 'search', {
    search_term: searchTerm
  });
}

// Analytics: Track exceptions/errors
export function trackError(description: string, fatal: boolean = false): void {
  if (!window.gtag) return;

  window.gtag('event', 'exception', {
    description,
    fatal
  });
}

// Analytics: Track timing
export function trackTiming(category: string, variable: string, value: number, label?: string): void {
  if (!window.gtag) return;

  window.gtag('event', 'timing_complete', {
    event_category: category,
    event_label: label,
    name: variable,
    value
  });
}

// Declare global gtag variable
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}
