import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import { useCartCashierStore } from '@/modules/checkoutBox/stores/useCartStoreCashier';

describe('useCartCashierStore clearPersistedDraft', () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
  });

  it('drops the in-memory draft and the persisted keys', () => {
    const store = useCartCashierStore();
    store.carts = [
      {
        id: 'cart-a',
        name: 'Open sale',
        items: [
          {
            productId: 'p1',
            name: 'Secret item',
            quantity: 1,
            price: 10,
            hasDiscount: false,
            discountAmount: 0,
            totalPrice: 10,
          },
        ],
        isEditing: false,
        showDropdown: false,
        createdAt: 1,
        lastUpdated: 1,
      },
    ];
    store.currentCartIndex = 0;
    store.saveCarts();

    store.clearPersistedDraft();

    expect(localStorage.getItem('userCarts')).toBeNull();
    expect(localStorage.getItem('currentCartIndex')).toBeNull();
    expect(store.carts).toHaveLength(1);
    expect(store.carts[0].items).toEqual([]);
    expect(store.carts[0].name).toBe('Carrito 1');
  });
});
