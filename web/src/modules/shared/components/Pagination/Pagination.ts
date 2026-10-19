import { defineComponent, computed, PropType } from 'vue';

export default defineComponent({
  name: 'Pagination',
  props: {
    currentPage: {
      type: Number,
      required: true,
    },
    totalPages: {
      type: Number,
      required: true,
    },
    maxPagesToShow: {
      type: Number,
      default: 5, // Máximo de páginas visibles en la paginación
    },
    onPageChange: {
      type: Function as PropType<(page: number) => void>,
      required: true,
    },
  },
  setup(props) {
    const rangeStart = computed(() =>
      Math.max(1, props.currentPage - Math.floor(props.maxPagesToShow / 2))
    );

    const rangeEnd = computed(() =>
      Math.min(props.totalPages, rangeStart.value + props.maxPagesToShow - 1)
    );

    const pagesInRange = computed(() =>
      Array.from({ length: rangeEnd.value - rangeStart.value + 1 }, (_, i) => rangeStart.value + i)
    );

    const goToPage = (page: number) => {
      if (page >= 1 && page <= props.totalPages) {
        props.onPageChange(page);
        window.scrollTo(0, 0); // Desplazar hacia arriba al cambiar de página
      }
    };

    const buttonClass = (disabled: boolean) => {
      return disabled
        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
        : 'bg-white text-primary border border-primary hover:bg-primary hover:text-white transition-colors';
    };

    return {
      rangeStart,
      rangeEnd,
      pagesInRange,
      goToPage,
      buttonClass,
    };
  },
});
