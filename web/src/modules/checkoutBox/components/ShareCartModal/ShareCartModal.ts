import { ref, computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { ModalName, useModalStore } from '@/modules/shared/store/useModalStore';
import { useToast } from '@/modules/ui/components';

export default {
  name: 'ShareCartModal',
  components: {
    FontAwesomeIcon,
  },
  props: {
    cartItems: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  setup(props) {
    const includePrices = ref(true);
    const includeImages = ref(false);
    const customMessage = ref('');
    const modalStore = useModalStore();
    const toast = useToast();

    // Computed
    const modalOpen = computed(() => modalStore.isOpen(ModalName.SHARE_CART));

    const cartTotal = computed(() => {
      return props.cartItems.reduce((total, item) => {
        return total + item.price * item.quantity;
      }, 0);
    });

    const cartLink = computed(() => {
      const baseUrl = window.location.origin;
      const cartId = generateCartId(); // Esta función debería generar un ID único para el carrito
      return `${baseUrl}/cart/${cartId}`;
    });

    // Methods

    const closeModal = () => {
      modalStore.close(ModalName.SHARE_CART);
    };

    const generateCartId = () => {
      // En una aplicación real, esto vendría del backend o se generaría de forma única
      return 'cart-' + Math.random().toString(36).substring(2, 9);
    };

    const generateShareMessage = () => {
      let message = customMessage.value || 'Hola, te comparto mi carrito de compras:\n\n';

      if (includePrices.value) {
        props.cartItems.forEach((item) => {
          message += `- ${item.quantity}x ${item.name} - $${item.price.toFixed(2)} c/u\n`;
        });
        message += `\nTotal: $${cartTotal.value.toFixed(2)}\n\n`;
      } else {
        message +=
          props.cartItems.map((item) => `- ${item.quantity}x ${item.name}`).join('\n') + '\n\n';
      }

      message += `Puedes ver el carrito aquí: ${cartLink.value}`;
      return message;
    };

    const shareViaWhatsApp = () => {
      const message = encodeURIComponent(generateShareMessage());
      window.open(`https://wa.me/?text=${message}`, '_blank');
      toast.success('Carrito compartido por WhatsApp');
    };

    const shareViaEmail = () => {
      const subject = encodeURIComponent('Comparto mi carrito de compras contigo');
      const body = encodeURIComponent(generateShareMessage());
      window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
      toast.success('Correo electrónico preparado');
    };

    const copyCartLink = async () => {
      try {
        await navigator.clipboard.writeText(cartLink.value);
        toast.success('Enlace copiado al portapapeles');
      } catch {
        toast.error('Error al copiar el enlace');
      }
    };

    return {
      includePrices,
      includeImages,
      customMessage,
      cartTotal,
      cartLink,
      closeModal,
      modalOpen,
      shareViaWhatsApp,
      shareViaEmail,
      copyCartLink,
      generateShareMessage,
    };
  },
};
