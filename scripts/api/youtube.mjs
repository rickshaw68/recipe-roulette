const API_KEY = import.meta.env.VITE_YOUTUBE_KEY;
console.log("🔑 YouTube API Key:", API_KEY);

export async function searchYouTubeVideos(query) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=3&key=${API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("YouTube API error");
    const data = await response.json();
    return data.items;
  } catch (err) {
    console.error("YouTube fetch error:", err);
    return [];
  }
}
