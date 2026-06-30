import { ref } from 'vue';

export function useCartTabs() {
  const carts = ref<any[]>([]);
  const currentCartIndex = ref(0);

  function addNewCart() {
    carts.value.push({ id: Math.random(), name: 'Nuevo carrito', items: [] });
    currentCartIndex.value = carts.value.length - 1;
  }

  function switchCart(index: number) {
    currentCartIndex.value = index;
  }

  function startEditing(index: number) {
    carts.value[index].isEditing = true;
  }

  function finishEditing(index: number) {
    carts.value[index].isEditing = false;
  }

  return { carts, currentCartIndex, addNewCart, switchCart, startEditing, finishEditing };
}
