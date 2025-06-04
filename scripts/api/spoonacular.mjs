const API_KEY = import.meta.env.VITE_SPOONACULAR_KEY;

export async function searchRecipesByIngredients(ingredients) {
  const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&number=5&apiKey=${API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Spoonacular fetch failed");

    const basicRecipes = await response.json();

    // grabbing the source Url as part of the detailed recipe information
    const detailedRecipes = await Promise.all(
      basicRecipes.map(recipe =>
        fetch(`https://api.spoonacular.com/recipes/${recipe.id}/information?apiKey=${API_KEY}`)
          .then(res => {
            if (!res.ok) throw new Error("Failed to fetch recipe details");
            return res.json();
          })
      )
    );

    return detailedRecipes;
  } catch (err) {
    console.error("Spoonacular API error:", err);
    return [];
  }
}
