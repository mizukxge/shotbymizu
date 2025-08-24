import { useEffect, useState } from "react";

/**
 * Fetches Instagram posts via Basic Display API.
 * Caches in localStorage for cacheMs (default 10 minutes) to reduce rate.
 */
export function useInstagramFeed(token, count = 6, cacheMs = 10 * 60 * 1000) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;

    const cacheKey = `ig-feed-${count}`;
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
      if (cached && Date.now() - cached.timestamp < cacheMs) {
        setPosts(cached.data);
        setLoading(false);
        return;
      }
    } catch {}

    async function fetchPosts() {
      setLoading(true);
      setError(null);
      try {
        const url =
          `https://graph.instagram.com/me/media` +
          `?fields=id,caption,media_url,permalink,thumbnail_url,media_type,timestamp` +
          `&access_token=${encodeURIComponent(token)}` +
          `&limit=${encodeURIComponent(count)}`;

        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || "Instagram API error");
        const arr = Array.isArray(data.data) ? data.data : [];
        setPosts(arr);
        try {
          localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: arr }));
        } catch {}
      } catch (err) {
        setError(err.message || "Failed to load Instagram feed");
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, [token, count, cacheMs]);

  return { posts, loading, error };
}

/** Prefer a thumbnail for VIDEO, otherwise media_url */
export function resolveIgImage(p) {
  if (!p) return "";
  if (p.media_type === "VIDEO" && p.thumbnail_url) return p.thumbnail_url;
  return p.media_url;
}
