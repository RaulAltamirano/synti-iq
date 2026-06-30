import { defineComponent } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import TitleCard from '@/modules/shared/components/TitleCard/TitleCard.vue';
import { Card, Button, Badge, Avatar, Skeleton, InfoBanner } from '@/modules/ui/components';
import StoreIdentityModal from '@/modules/store/components/StoreIdentityModal/StoreIdentityModal.vue';
import StoreSalesTargetsModal from '@/modules/store/components/StoreSalesTargetsModal/StoreSalesTargetsModal.vue';
import StoreSchedulesModal from '@/modules/store/components/StoreSchedulesModal/StoreSchedulesModal.vue';
import { useStoreDetailsPage } from '../../composables/useStoreDetailsPage';

export default defineComponent({
  name: 'StoreDetails',
  components: {
    TitleCard,
    FontAwesomeIcon,
    Card,
    Button,
    Badge,
    Avatar,
    Skeleton,
    InfoBanner,
    StoreIdentityModal,
    StoreSalesTargetsModal,
    StoreSchedulesModal,
  },
  setup() {
    return useStoreDetailsPage();
  },
});
