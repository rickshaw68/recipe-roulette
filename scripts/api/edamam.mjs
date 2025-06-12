const APP_ID = import.meta.env.VITE_EDAMAM_APP_ID;
const APP_KEY = import.meta.env.VITE_EDAMAM_KEY;
const ACCOUNT_USER = "kromed68"; // my Edamam account name

export async function searchEdamamRecipes(query, diet = "", cuisine = "", maxTime = "") {
  const params = new URLSearchParams({
    type: "public",
    q: query,
    app_id: APP_ID,
    app_key: APP_KEY,
  });

  if (diet) params.append("diet", diet);              
  if (cuisine) params.append("cuisineType", cuisine); 
  if (maxTime) params.append("time", `1-${maxTime}`); 

  const url = `https://api.edamam.com/api/recipes/v2?${params.toString()}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Edamam-Account-User": ACCOUNT_USER
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


export async function getEdamamRecipeByURI(encodedUri) {
  const reEncodedUri = encodeURIComponent(decodeURIComponent(encodedUri));

  const url = `https://api.edamam.com/api/recipes/v2/by-uri?uri=${reEncodedUri}&type=public&app_id=${APP_ID}&app_key=${APP_KEY}`;
  console.log("Edamam fetch URL:", url);

  try {
    const res = await fetch(url, {
      headers: {
        "Edamam-Account-User": ACCOUNT_USER
      }
    });

    if (!res.ok) throw new Error("Failed to fetch Edamam recipe");

    const data = await res.json();
    const recipe = data.hits[0]?.recipe;

    if (!recipe) throw new Error("No recipe found in Edamam response");

    return {
  label: recipe.label,
  image: recipe.image,
  url: recipe.url,
  ingredients: recipe.ingredientLines,
  totalNutrients: recipe.totalNutrients
};

  } catch (err) {
    console.error("Edamam recipe fetch error:", err);
    return null;
  }
}
