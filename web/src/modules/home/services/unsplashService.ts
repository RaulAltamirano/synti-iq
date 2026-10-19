const FALLBACK =
  'https://images.pexels.com/photos/3075993/pexels-photo-3075993.jpeg?auto=compress&cs=tinysrgb&w=1920';

export async function fetchRandomImages({ count = 6 } = {}) {
  const key = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
  if (!key) return [FALLBACK];

  const url = `https://api.unsplash.com/photos/random?query=landscape&count=${count}&orientation=landscape`;
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${key}`,
        'Accept-Version': 'v1',
      },
    });
    if (!res.ok) return [FALLBACK];

    const data = await res.json();
    const items = Array.isArray(data) ? data : [data];
    const urls = items
      .map((item: { urls?: { regular?: string } }) => item?.urls?.regular)
      .filter(Boolean);
    return urls.length ? urls : [FALLBACK];
  } catch {
    return [FALLBACK];
  }
}
