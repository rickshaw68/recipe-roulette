const API_KEY = import.meta.env.VITE_SPOONACULAR_KEY;

export async function searchRecipesByIngredients(ingredients, diet, cuisine, maxTime) {
  const params = new URLSearchParams({
    includeIngredients: ingredients,
    number: 5,
    apiKey: API_KEY
  });

  if (diet) params.append("diet", diet);
  if (cuisine) params.append("cuisine", cuisine);
  if (maxTime) params.append("maxReadyTime", maxTime);

  const url = `https://api.spoonacular.com/recipes/complexSearch?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Spoonacular fetch failed");

    const { results } = await response.json();

    const detailedRecipes = await Promise.all(
      results.map(recipe =>
        fetch(`https://api.spoonacular.com/recipes/${recipe.id}/information?includeNutrition=true&apiKey=${API_KEY}`)
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


export async function getSpoonacularRecipeById(id) {
  const url = `https://api.spoonacular.com/recipes/${id}/information?includeNutrition=true&apiKey=${API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch recipe details");

    const recipe = await response.json();
    return {
      title: recipe.title,
      image: recipe.image,
      ingredients: recipe.extendedIngredients.map(ing => ing.original),
      instructions: recipe.instructions,
      url: recipe.sourceUrl
    };
  } catch (err) {
    console.error("Spoonacular API error:", err);
    return null;
  }
}

