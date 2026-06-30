// export default defineComponent({
//   name: 'ParallaxImageGallery',
//   components: {
//     // Componentes adicionales si los necesitas
//   },
//   props: {
//     fallbackImage: {
//       type: String,
//       default: '/images/default-coding-bg.jpg'
//     }
//   },
//   setup(props) {
//     // Uso del composable para la galería de imágenes
//     const {
//       images,
//       currentImageIndex,
//       currentImage,
//       loading,
//       fetchImages,
//       handleImageLoad,
//       nextImage,
//       prevImage
//     } = useImageGallery(props.fallbackImage);

//     // Uso del composable para el efecto parallax
//     const {
//       parallaxContainer,
//       parallaxX,
//       parallaxY,
//       imageScale,
//       handleMouseMove,
//       handleMouseLeave,
//       startParallaxAnimation,
//       stopParallaxAnimation
//     } = useParallaxEffect();

//     // Uso del composable para el autoplay
//     const {
//       autoplay,
//       intervalTime,
//       toggleAutoplay,
//       startAutoplay,
//       stopAutoplay,
//       resetAutoplayTimer,
//       updateInterval
//     } = useAutoplay(nextImage);

//     // Inicializar componente
//     onMounted(async () => {
//       await fetchImages();
//       startAutoplay();
//       startParallaxAnimation();

//       // Configurar eventos para detección de foco
//       window.addEventListener('blur', stopAutoplay);
//       window.addEventListener('focus', resumeAutoplayIfEnabled);
//     });

//     // Limpiar recursos al desmontar
//     onBeforeUnmount(() => {
//       stopAutoplay();
//       stopParallaxAnimation();
//       window.removeEventListener('blur', stopAutoplay);
//       window.removeEventListener('focus', resumeAutoplayIfEnabled);
//     });

//     // Función para reanudar el autoplay si está habilitado
//     function resumeAutoplayIfEnabled(): void {
//       if (autoplay.value && !intervalTime.value) {
//         startAutoplay();
//       }
//     }

//     return {
//       // Estado
//       images,
//       currentImageIndex,
//       currentImage,
//       loading,
//       autoplay,
//       intervalTime,
//       parallaxContainer,
//       parallaxX,
//       parallaxY,
//       imageScale,

//       // Métodos
//       handleImageLoad,
//       nextImage,
//       prevImage,
//       toggleAutoplay,
//       updateInterval,
//       handleMouseMove,
//       handleMouseLeave
//     };
//   }
// });
