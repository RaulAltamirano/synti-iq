import { computed, defineComponent, PropType, ref } from 'vue';

export interface Product {
  images: unknown;
  isNew: unknown;
  discount: unknown;
  reviews: unknown;
  oldPrice: unknown;
  features: unknown;
  id: number;
  name: string;
  price: number;
  rating: number;
  image: string;
  description: string;
}

export default defineComponent({
  name: 'QuickView',
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
    product: {
      type: Object as PropType<Product | null>,
      default: null,
    },
  },
  setup(props) {
    // const emit = defineEmits(['close', 'add-to-cart'])

    const quantity = ref(1);
    const isFavorite = ref(false);
    const currentImageIndex = ref(0);
    const showZoom = ref(false);
    const isZoomed = ref(false);

    // Productos sugeridos de ejemplo
    const suggestedProducts = ref([
      {
        id: 1,
        name: 'Producto Relacionado 1',
        price: 29.99,
        image:
          'https://images.unsplash.com/photo-1730758405638-ab8659278e96?q=80&w=2127&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      },
      {
        id: 2,
        name: 'Producto Relacionado 2',
        price: 34.99,
        image: '/api/placeholder/100/100',
      },
      {
        id: 3,
        name: 'Producto Relacionado 3',
        price: 24.99,
        image: '/api/placeholder/100/100',
      },
      {
        id: 4,
        name: 'Producto Relacionado 4',
        price: 39.99,
        image: '/api/placeholder/100/100',
      },
    ]);

    const currentImage = computed(() => {
      if (!props.product?.image?.length) return props.product?.image;
      return props.product.image[currentImageIndex.value];
    });

    // Métodos de la galería
    const selectImage = (index) => {
      currentImageIndex.value = index;
    };

    const nextImage = () => {
      if (!props.product?.image?.length) return;
      currentImageIndex.value = (currentImageIndex.value + 1) % props.product.image.length;
    };

    const prevImage = () => {
      if (!props.product?.image?.length) return;
      currentImageIndex.value =
        currentImageIndex.value === 0
          ? props.product.image.length - 1
          : currentImageIndex.value - 1;
    };

    const openZoom = () => {
      showZoom.value = true;
    };

    const closeZoom = () => {
      showZoom.value = false;
    };

    // Computed para las estrellas de calificación
    const stars = computed(() => {
      const rating = suggestedProducts.value?.rating || 0;
      const stars = [];
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 !== 0;

      for (let i = 0; i < fullStars; i++) {
        stars.push({ id: i, type: 'full' });
      }

      if (hasHalfStar) {
        stars.push({ id: stars.length, type: 'half' });
      }

      return stars;
    });

    // Métodos
    const incrementQuantity = () => {
      quantity.value++;
    };

    const decrementQuantity = () => {
      if (quantity.value > 1) {
        quantity.value--;
      }
    };
    const hasMultipleImages = computed(() => props.product.image.length > 1);
    const addToCart = () => {
      emit('add-to-cart', {
        ...suggestedProducts.value,
        quantity: quantity.value,
      });
    };

    const toggleFavorite = () => {
      isFavorite.value = !isFavorite.value;
    };

    const shareProduct = () => {
      // Implementar lógica de compartir
      if (navigator.share) {
        navigator.share({
          title: suggestedProducts.value.name,
          text: suggestedProducts.value.description,
          url: window.location.href,
        });
      }
    };
    return {
      suggestedProducts,
      stars,
      incrementQuantity,
      decrementQuantity,
      isZoomed,
      quantity,
      showZoom,
      currentImageIndex,
      addToCart,
      toggleFavorite,
      shareProduct,
      currentImage,
      selectImage,
      nextImage,
      prevImage,
      openZoom,
      closeZoom,
      isFavorite,
      hasMultipleImages,
    };
  },
});
