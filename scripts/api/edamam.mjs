const APP_ID = import.meta.env.VITE_EDAMAM_APP_ID;
const APP_KEY = import.meta.env.VITE_EDAMAM_KEY;

export async function searchEdamamRecipes(query) {
  const url = `https://api.edamam.com/api/recipes/v2?type=public&q=${query}&app_id=${APP_ID}&app_key=${APP_KEY}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Edamam-Account-User": "kromed68"
      }
    });

    if (!response.ok) throw new Error("Edamam fetch failed");

    const data = await response.json();
    return data.hits;
  } catch (err) {
    console.error("Edamam API error:", err);
    return [];
  }
}
