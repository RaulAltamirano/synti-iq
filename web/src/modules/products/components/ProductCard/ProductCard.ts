import { defineComponent, PropType } from 'vue';

export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  image: string;
  description: string;
}

export default defineComponent({
  name: 'ProductCard',
  props: {
    product: {
      type: Object as PropType<Product>,
      required: true,
    },
  },
});
