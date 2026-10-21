// stores/cartStore.ts
import { defineStore } from 'pinia';

// Interfaces mejoradas con tipos estrictos
export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  barcode: string | null;
  purchasePrice: number;
  sellingPrice: number;
  taxRate: number;
  size: string;
  color: string | null;
  brand: string;
  // dimensions: Dimensions | null;
  isActive: boolean;
  createdAt: string; // ISO string format (puedes convertir a Date si prefieres)
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  salesRank: number;
  profitMargin: number;
  isPerishable: boolean;
  expirationPeriod: number; // en días
  leadTime: number | null;
  imageUrl: string | null;
  tags: string[];
  // inventoryItems: InventoryItem[];
}

interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  originalPrice?: number;
  hasDiscount: boolean;
  discountAmount: number;
  totalPrice: number;
  imageUrl?: string;
}

interface Cart {
  id: string;
  name: string;
  items: CartItem[];
  isEditing: boolean;
  showDropdown: boolean;
  createdAt: number; // Timestamp para ordenación
  lastUpdated: number; // Timestamp para tracking
}

/**
 * Store que gestiona los carritos de compra para el cajero
 */
export const useCartCashierStore = defineStore('cart-cashier', {
  state: () => ({
    carts: [] as Cart[],
    currentCartIndex: 0,
    isPriceCheckerActive: false,
    showPriceChecker: false,
    selectedProduct: null as Product | null,
    // Cache para productos frecuentes
    productsCache: new Map<string, Product>(),
    // Estado para seguimiento de operaciones
    isLoading: false,
    lastError: null as Error | null,
  }),

  actions: {
    /**
     * Inicializa los carritos si no existen
     */
    initializeCarts() {
      if (this.carts.length === 0) {
        const now = Date.now();
        this.carts = [
          {
            id: this.generateId(),
            name: 'Carrito 1',
            items: [],
            isEditing: false,
            showDropdown: false,
            createdAt: now,
            lastUpdated: now,
          },
        ];
      }
    },

    /**
     * Genera un ID único para carritos e items
     */
    generateId(): string {
      return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
    },

    /**
     * Persiste los carritos en localStorage
     */
    saveCarts() {
      try {
        localStorage.setItem('userCarts', JSON.stringify(this.carts));
        localStorage.setItem('currentCartIndex', String(this.currentCartIndex));
      } catch (error) {
        this.lastError = error instanceof Error ? error : new Error('Error desconocido al guardar');
      }
    },

    clearPersistedDraft() {
      this.carts = [];
      this.currentCartIndex = 0;
      this.selectedProduct = null;
      this.initializeCarts();
      try {
        localStorage.removeItem('userCarts');
        localStorage.removeItem('currentCartIndex');
      } catch (error) {
        this.lastError = error instanceof Error ? error : new Error('Error desconocido al guardar');
      }
    },

    /**
     * Carga los carritos desde localStorage con manejo de errores
     */
    loadCarts() {
      this.isLoading = true;
      try {
        const savedCarts = localStorage.getItem('userCarts');
        const savedIndex = localStorage.getItem('currentCartIndex');

        if (savedCarts) {
          // Hydratación segura con validación básica
          const parsed = JSON.parse(savedCarts);
          if (Array.isArray(parsed)) {
            // Validar que cada carrito tiene la estructura esperada
            this.carts = parsed.map((cart) => {
              // Asegurar que todos los campos existan
              return {
                id: cart.id || this.generateId(),
                name: cart.name || 'Carrito',
                items: Array.isArray(cart.items) ? cart.items.map(this.normalizeCartItem) : [],
                isEditing: false, // Siempre iniciar como no editando
                showDropdown: false, // Siempre iniciar con dropdown cerrado
                createdAt: cart.createdAt || Date.now(),
                lastUpdated: cart.lastUpdated || Date.now(),
              };
            });
          } else {
            this.initializeCarts();
          }
        } else {
          this.initializeCarts();
        }

        if (savedIndex !== null) {
          const parsedIndex = parseInt(savedIndex, 10);
          // Validar que el índice está en rango
          if (!isNaN(parsedIndex) && parsedIndex >= 0 && parsedIndex < this.carts.length) {
            this.currentCartIndex = parsedIndex;
          }
        }

        // Reconstruir la caché de productos
        this.rebuildProductsCache();
      } catch (error) {
        this.lastError = error instanceof Error ? error : new Error('Error desconocido al cargar');
        this.initializeCarts();
      } finally {
        this.isLoading = false;
      }
    },

    parsePrice(value: unknown, fallback = 0): number {
      const parsed = typeof value === 'string' ? parseFloat(value) : value;
      return typeof parsed === 'number' && !isNaN(parsed) ? parsed : fallback;
    },

    /**
     * Normaliza un item del carrito para asegurar todos los campos requeridos
     */
    normalizeCartItem(item: Partial<CartItem>): CartItem {
      const price = this.parsePrice(item.price, 0);
      const quantity = typeof item.quantity === 'number' ? item.quantity : 1;
      const originalPrice = this.parsePrice(item.originalPrice, price);

      const hasDiscount = originalPrice > price;
      const discountAmount = hasDiscount ? originalPrice - price : 0;

      return {
        productId: item.productId || '',
        name: item.name || 'Producto sin nombre',
        quantity,
        price,
        originalPrice: hasDiscount ? originalPrice : undefined,
        hasDiscount,
        discountAmount,
        totalPrice: price * quantity,
        imageUrl: item.imageUrl ?? undefined,
      };
    },

    /**
     * Reconstruye la caché de productos desde los items del carrito
     */
    rebuildProductsCache() {
      this.productsCache.clear();

      this.carts.forEach((cart) => {
        cart.items.forEach((item) => {
          if (!this.productsCache.has(item.productId)) {
            // Extraer información básica del producto desde el item
            this.productsCache.set(item.productId, {
              id: item.productId,
              name: item.name,
              price: item.price,
              stock: 0, // Valor por defecto, se actualizará cuando obtengamos datos reales
            });
          }
        });
      });
    },

    /**
     * Añade un producto al carrito actual con soporte para descuentos
     */
    addProductToCart(
      productId: string,
      product: Product,
      quantity: number = 1,
      options: {
        applyDiscount?: boolean;
        discountedPrice?: number;
      } = {}
    ) {
      const cart = this.carts[this.currentCartIndex];
      if (!cart) return;

      // Asegurarse que items existe
      if (!cart.items) {
        cart.items = [];
      }

      const existingItemIndex = cart.items.findIndex((item) => item.productId === productId);
      const { applyDiscount, discountedPrice } = options;

      const price = discountedPrice !== undefined ? discountedPrice : product.sellingPrice;
      const originalPrice = applyDiscount ? product.sellingPrice : undefined;
      const hasDiscount =
        applyDiscount === true && originalPrice !== undefined && originalPrice > price;
      const discountAmount = hasDiscount && originalPrice !== undefined ? originalPrice - price : 0;

      if (existingItemIndex >= 0) {
        // Actualizar cantidad si ya existe
        const item = cart.items[existingItemIndex];
        item.quantity += quantity;

        // Actualizar precios y descuentos si se proporcionan
        if (discountedPrice !== undefined || applyDiscount) {
          item.price = price;
          item.originalPrice = originalPrice;
          item.hasDiscount = hasDiscount;
          item.discountAmount = discountAmount;
        }

        // Actualizar totalPrice
        item.totalPrice = item.price * item.quantity;
      } else {
        // Agregar nuevo item si no existe
        const newItem: CartItem = {
          productId,
          name: product.name,
          quantity,
          price,
          originalPrice,
          hasDiscount: hasDiscount,
          discountAmount,
          totalPrice: price * quantity,
          // imageUrl: product.,
        };

        cart.items.push(newItem);
      }

      // Guardar el producto en cache para referencia rápida
      this.productsCache.set(productId, product);

      // Actualizar timestamp
      cart.lastUpdated = Date.now();

      this.saveCarts();
    },

    /**
     * Actualiza la cantidad de un producto en el carrito
     */
    updateCartItemQuantity(productId: string, newQuantity: number) {
      if (newQuantity <= 0) {
        return this.removeProductFromCart(productId, Infinity); // Eliminar completamente
      }

      const cart = this.carts[this.currentCartIndex];
      if (!cart) return;

      const existingItemIndex = cart.items.findIndex((item) => item.productId === productId);

      if (existingItemIndex >= 0) {
        const item = cart.items[existingItemIndex];
        item.quantity = newQuantity;
        item.totalPrice = item.price * newQuantity;

        cart.lastUpdated = Date.now();
        this.saveCarts();
      }
    },

    /**
     * Actualiza el precio de un producto en el carrito
     */
    updateCartItemPrice(
      productId: string,
      newPrice: number,
      options: {
        updateOriginalPrice?: boolean;
        applyAsDiscount?: boolean;
      } = {}
    ) {
      const cart = this.carts[this.currentCartIndex];
      if (!cart) return;

      const existingItemIndex = cart.items.findIndex((item) => item.productId === productId);

      if (existingItemIndex >= 0) {
        const item = cart.items[existingItemIndex];

        if (options.updateOriginalPrice) {
          item.originalPrice = item.price;
        } else if (options.applyAsDiscount && newPrice < item.price) {
          item.originalPrice = item.price;
          item.hasDiscount = true;
          item.discountAmount = item.price - newPrice;
        }

        item.price = newPrice;
        item.totalPrice = newPrice * item.quantity;

        // Actualizar estado de descuento
        if (item.originalPrice) {
          item.hasDiscount = item.originalPrice > item.price;
          item.discountAmount = item.hasDiscount ? item.originalPrice - item.price : 0;
        }

        cart.lastUpdated = Date.now();
        this.saveCarts();
      }
    },

    /**
     * Elimina un producto del carrito (parcial o totalmente)
     */
    removeProductFromCart(productId: string, quantity: number = 1) {
      const cart = this.carts[this.currentCartIndex];
      if (!cart) return;

      const existingItemIndex = cart.items.findIndex((item) => item.productId === productId);

      if (existingItemIndex >= 0) {
        const item = cart.items[existingItemIndex];

        if (item.quantity <= quantity) {
          // Eliminar el item completamente
          cart.items.splice(existingItemIndex, 1);
        } else {
          // Reducir la cantidad
          item.quantity -= quantity;
          item.totalPrice = item.price * item.quantity;
        }

        cart.lastUpdated = Date.now();
        this.saveCarts();
      }
    },

    /**
     * Añade un nuevo carrito vacío
     */
    addNewCart() {
      const now = Date.now();
      this.carts.push({
        id: this.generateId(),
        name: `Carrito ${this.carts.length + 1}`,
        items: [],
        isEditing: false,
        showDropdown: false,
        createdAt: now,
        lastUpdated: now,
      });
      this.saveCarts();
    },

    /**
     * Cambia al carrito especificado
     */
    switchCart(index: number) {
      if (index >= 0 && index < this.carts.length) {
        this.currentCartIndex = index;
        this.saveCarts();
      }
    },

    /**
     * Inicia la edición del nombre de un carrito
     */
    startEditing(index: number) {
      if (this.carts[index]) {
        this.carts[index].isEditing = true;
      }
    },

    /**
     * Finaliza la edición del nombre de un carrito
     */
    finishEditing(index: number, newName?: string) {
      if (this.carts[index]) {
        if (newName) {
          this.carts[index].name = newName;
        }
        this.carts[index].isEditing = false;
        this.carts[index].lastUpdated = Date.now();
        this.saveCarts();
      }
    },

    /**
     * Controla la visibilidad del dropdown de un carrito
     */
    toggleDropdown(index: number) {
      // Cerrar todos los otros dropdowns primero
      this.carts.forEach((cart, i) => {
        if (i !== index && cart) {
          cart.showDropdown = false;
        }
      });

      // Toggle el dropdown actual
      if (this.carts[index]) {
        this.carts[index].showDropdown = !this.carts[index].showDropdown;
      }
    },

    /**
     * Cierra todos los dropdowns
     */
    closeAllDropdowns() {
      this.carts.forEach((cart) => {
        if (cart) cart.showDropdown = false;
      });
    },

    /**
     * Duplica un carrito existente
     */
    duplicateCart(index: number) {
      const cartToDuplicate = this.carts[index];
      if (!cartToDuplicate) return;

      const now = Date.now();
      const newCart = {
        ...JSON.parse(JSON.stringify(cartToDuplicate)),
        id: this.generateId(),
        name: `${cartToDuplicate.name} (copia)`,
        showDropdown: false,
        createdAt: now,
        lastUpdated: now,
      };

      this.carts.splice(index + 1, 0, newCart);
      this.closeAllDropdowns();
      this.saveCarts();
    },

    /**
     * Vacía todos los productos de un carrito
     */
    clearCart(index: number) {
      if (this.carts[index]) {
        this.carts[index].items = [];
        this.carts[index].lastUpdated = Date.now();
        this.closeAllDropdowns();
        this.saveCarts();
      }
    },

    /**
     * Elimina un carrito completo
     */
    removeCart(index: number) {
      if (this.carts.length <= 1 || !this.carts[index]) {
        return; // No permitir eliminar el último carrito o si no existe
      }

      this.carts.splice(index, 1);

      // Ajustar el índice actual si es necesario
      if (this.currentCartIndex >= this.carts.length) {
        this.currentCartIndex = this.carts.length - 1;
      }

      this.closeAllDropdowns();
      this.saveCarts();
    },

    /**
     * Mueve un carrito a otra posición
     */
    moveCart(fromIndex: number, toIndex: number) {
      if (
        fromIndex === toIndex ||
        fromIndex < 0 ||
        fromIndex >= this.carts.length ||
        toIndex < 0 ||
        toIndex >= this.carts.length
      )
        return;

      const cartToMove = this.carts[fromIndex];
      this.carts.splice(fromIndex, 1);
      this.carts.splice(toIndex, 0, cartToMove);

      // Actualizar currentCartIndex si el carrito activo se movió
      if (this.currentCartIndex === fromIndex) {
        this.currentCartIndex = toIndex;
      } else if (
        (fromIndex < this.currentCartIndex && toIndex >= this.currentCartIndex) ||
        (fromIndex > this.currentCartIndex && toIndex <= this.currentCartIndex)
      ) {
        // Ajustar el índice si el movimiento afecta la posición del carrito actual
        this.currentCartIndex += fromIndex < this.currentCartIndex ? -1 : 1;
      }

      this.saveCarts();
    },

    /**
     * Activa/desactiva el verificador de precios
     */
    togglePriceChecker() {
      this.isPriceCheckerActive = !this.isPriceCheckerActive;
      this.showPriceChecker = this.isPriceCheckerActive;
    },

    /**
     * Aplica un descuento a un item específico del carrito
     */
    applyDiscountToItem(
      productId: string,
      discountAmount: number,
      discountType: 'percentage' | 'fixed' = 'percentage'
    ) {
      const cart = this.carts[this.currentCartIndex];
      if (!cart) return;

      const itemIndex = cart.items.findIndex((item) => item.productId === productId);
      if (itemIndex < 0) return;

      const item = cart.items[itemIndex];
      const originalPrice = item.originalPrice || item.price;

      let newPrice: number;
      if (discountType === 'percentage') {
        // El descuento es un porcentaje (0-100)
        const discountMultiplier = 1 - Math.min(100, Math.max(0, discountAmount)) / 100;
        newPrice = originalPrice * discountMultiplier;
      } else {
        // El descuento es una cantidad fija
        newPrice = Math.max(0, originalPrice - discountAmount);
      }

      this.updateCartItemPrice(productId, newPrice, {
        updateOriginalPrice: false,
        applyAsDiscount: true,
      });
    },

    /**
     * Aplica un descuento a todo el carrito
     */
    applyDiscountToCart(
      discountAmount: number,
      discountType: 'percentage' | 'fixed' = 'percentage'
    ) {
      const cart = this.carts[this.currentCartIndex];
      if (!cart || cart.items.length === 0) return;

      cart.items.forEach((item) => {
        this.applyDiscountToItem(item.productId, discountAmount, discountType);
      });
    },

    /**
     * Prepara un carrito para compartir
     */
    shareCart(index: number = this.currentCartIndex) {
      const cart = this.carts[index];
      if (!cart) return null;

      // Crear una representación compartible del carrito
      const shareableCart = {
        id: cart.id,
        name: cart.name,
        createdAt: cart.createdAt,
        items: cart.items.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          originalPrice: item.originalPrice,
          hasDiscount: item.hasDiscount,
          discountAmount: item.discountAmount,
          quantity: item.quantity,
          totalPrice: item.totalPrice,
        })),
        totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0),
        totalAmount: cart.items.reduce((sum, item) => sum + item.totalPrice, 0),
        totalDiscount: cart.items.reduce(
          (sum, item) => sum + item.discountAmount * item.quantity,
          0
        ),
      };

      return shareableCart;
    },
  },

  getters: {
    /**
     * Obtiene el carrito actual
     */
    currentCart: (state) => {
      return state.carts[state.currentCartIndex] || null;
    },

    /**
     * Obtiene el número total de items en el carrito actual
     */
    cartItemsCount: (state) => {
      const cart = state.carts[state.currentCartIndex];
      if (!cart) return 0;

      return cart.items.reduce((total, item) => total + item.quantity, 0);
    },

    /**
     * Obtiene el total del carrito actual
     */
    cartTotal: (state) => {
      const cart = state.carts[state.currentCartIndex];
      if (!cart) return 0;

      return cart.items.reduce((total, item) => total + item.totalPrice, 0);
    },

    /**
     * Obtiene el total de descuentos aplicados en el carrito actual
     */
    cartDiscountTotal: (state) => {
      const cart = state.carts[state.currentCartIndex];
      if (!cart) return 0;

      return cart.items.reduce((total, item) => {
        const discountPerItem = item.hasDiscount ? item.discountAmount : 0;
        return total + discountPerItem * item.quantity;
      }, 0);
    },

    /**
     * Obtiene los items del carrito actual con detalles completos
     * Memoizado para mejorar rendimiento
     */
    cartItemsWithDetails: (state) => {
      const cart = state.carts[state.currentCartIndex];
      if (!cart) return [];

      return cart.items.map((item) => ({
        ...item,
        // Datos adicionales que podrían necesitarse para la tabla
        subtotal: item.totalPrice,
        discountTotal: item.hasDiscount ? item.discountAmount * item.quantity : 0,
        // Añadir información adicional del producto si está en caché
        ...state.productsCache.get(item.productId),
      }));
    },

    /**
     * Obtiene el estado actual del carrito para seguimiento
     */
    cartStatus: (state) => {
      return {
        totalCarts: state.carts.length,
        currentIndex: state.currentCartIndex,
        isLoading: state.isLoading,
        hasError: state.lastError !== null,
        error: state.lastError,
      };
    },

    /**
     * Verifica si el carrito actual está vacío
     */
    isCartEmpty: (state) => {
      const cart = state.carts[state.currentCartIndex];
      return !cart || cart.items.length === 0;
    },

    /**
     * Obtiene un resumen del carrito actual
     */
    cartSummary: (state) => {
      const cart = state.carts[state.currentCartIndex];
      if (!cart) return null;

      const totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      const subtotal = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
      const totalDiscount = cart.items.reduce((sum, item) => {
        return sum + (item.hasDiscount ? item.discountAmount * item.quantity : 0);
      }, 0);

      return {
        id: cart.id,
        name: cart.name,
        itemCount: cart.items.length,
        totalQuantity,
        subtotal,
        totalDiscount,
        total: subtotal - totalDiscount,
        lastUpdated: cart.lastUpdated,
      };
    },
  },
});
