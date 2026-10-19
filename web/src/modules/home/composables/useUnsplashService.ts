const API_URL = 'https://api.unsplash.com/photos/random';
const FALLBACK = {
  url: 'https://images.pexels.com/photos/3075993/pexels-photo-3075993.jpeg?auto=compress&cs=tinysrgb&w=1920',
  description: 'Background image',
  photographer: 'Pexels',
  creditUrl: 'https://www.pexels.com',
  color: '#394649',
};

export function useUnsplashService() {
  const key = import.meta.env?.VITE_UNSPLASH_ACCESS_KEY || '';

  const getRandomImage = async (options: { orientation?: string; topic?: string } = {}) => {
    if (!key) return FALLBACK;

    const params = new URLSearchParams({
      orientation: options.orientation || 'landscape',
      count: '1',
    });
    if (options.topic) params.append('query', options.topic);

    try {
      const res = await fetch(`${API_URL}?${params}`, {
        headers: {
          Authorization: `Client-ID ${key}`,
          'Accept-Version': 'v1',
        },
      });
      if (!res.ok) return FALLBACK;

      const data = await res.json();
      const img = Array.isArray(data) ? data[0] : data;

      return {
        url: img.urls?.regular || FALLBACK.url,
        description: img.description || img.alt_description || 'Background image',
        photographer: img.user?.name || 'Unknown',
        creditUrl: img.user?.links?.html || '',
        color: img.color || '#e2e8f0',
      };
    } catch {
      return FALLBACK;
    }
  };

  return {
    getRandomImage,
    getFallbackImage: () => FALLBACK,
  };
}
