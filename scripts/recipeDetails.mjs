import { getSpoonacularRecipeById } from './api/spoonacular.mjs';
import { getEdamamRecipeByURI } from './api/edamam.mjs';
import { searchYouTubeVideos } from './api/youtube.mjs';

document.addEventListener("DOMContentLoaded", async () => {
  console.log("recipeDetails.mjs loaded");

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const source = params.get("source");
  const detailSection = document.getElementById("recipe-details");

  if (!id || !source) {
    detailSection.innerHTML = "<p>Error: ❌ Invalid recipe link. Please go back and try again.</p>";
    return;
  }

  try {
    // Handle YouTube videos 
    if (source === "youtube") {
      detailSection.innerHTML = `
        <h2>YouTube Tutorial</h2>
        <iframe width="560" height="315" src="https://www.youtube.com/embed/${id}"
          title="YouTube video player" frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen>
        </iframe>
      `;
    } else {
      let recipe;

      if (source === "spoonacular") {
        recipe = await getSpoonacularRecipeById(id);        
      } else if (source === "edamam") {
        recipe = await getEdamamRecipeByURI(id);        
      } else {
        throw new Error("Unknown source");
      }

      if (!recipe) {
        detailSection.innerHTML = "<p>Error: ❌ Recipe not found. Please go back and try again.</p>";
        return;
      }

      const ingredients = recipe.ingredients || recipe.ingredientLines || [];

      let nutritionHTML = "";

if (source === "spoonacular" && recipe.nutrition) {
  const { nutrients } = recipe.nutrition;
  const calories = nutrients.find(n => n.name === "Calories")?.amount;
  const protein = nutrients.find(n => n.name === "Protein")?.amount;
  const fat = nutrients.find(n => n.name === "Fat")?.amount;
  const carbs = nutrients.find(n => n.name === "Carbohydrates")?.amount;

  nutritionHTML = `
    <h3>Nutrition Facts (per serving):</h3>
    <table class="nutrition-table">
      <tr><td>Calories</td><td>${calories} kcal</td></tr>
      <tr><td>Protein</td><td>${protein} g</td></tr>
      <tr><td>Fat</td><td>${fat} g</td></tr>
      <tr><td>Carbs</td><td>${carbs} g</td></tr>
    </table>
  `;
} else if (source === "edamam" && recipe.totalNutrients) {
  const n = recipe.totalNutrients;

  nutritionHTML = `
    <h3>Nutrition Facts (per recipe):</h3>
    <table class="nutrition-table">
      <tr><td>Calories</td><td>${Math.round(n.ENERC_KCAL?.quantity || 0)} kcal</td></tr>
      <tr><td>Protein</td><td>${Math.round(n.PROCNT?.quantity || 0)} g</td></tr>
      <tr><td>Fat</td><td>${Math.round(n.FAT?.quantity || 0)} g</td></tr>
      <tr><td>Saturated Fat</td><td>${Math.round(n.FASAT?.quantity || 0)} g</td></tr>
      <tr><td>Carbohydrates</td><td>${Math.round(n.CHOCDF?.quantity || 0)} g</td></tr>
      <tr><td>Fiber</td><td>${Math.round(n.FIBTG?.quantity || 0)} g</td></tr>
      <tr><td>Sugar</td><td>${Math.round(n.SUGAR?.quantity || 0)} g</td></tr>
      <tr><td>Sodium</td><td>${Math.round(n.NA?.quantity || 0)} mg</td></tr>
      <tr><td>Calcium</td><td>${Math.round(n.CA?.quantity || 0)} mg</td></tr>
      <tr><td>Iron</td><td>${Math.round(n.FE?.quantity || 0)} mg</td></tr>
      <tr><td>Potassium</td><td>${Math.round(n.K?.quantity || 0)} mg</td></tr>
      <tr><td>Vitamin A</td><td>${Math.round(n.VITA_RAE?.quantity || 0)} µg</td></tr>
      <tr><td>Vitamin C</td><td>${Math.round(n.VITC?.quantity || 0)} mg</td></tr>
    </table>
  `;
} else {
  nutritionHTML = `<p><a href="${recipe.url}" target="_blank">View full nutrition info</a></p>`;
}

detailSection.innerHTML = `
  <h2>${recipe.title || recipe.label}</h2>
  <img src="${recipe.image}" alt="${recipe.title || recipe.label}" style="display:block; margin:1rem auto; max-width:90%;" />
  ${nutritionHTML}
  <p><strong>Ingredients:</strong></p>
  <ul>
    ${ingredients.map(ing => `<li>${ing}</li>`).join("")}
  </ul>  
  ${recipe.instructions
    ? `<p><strong>Instructions:</strong></p><div class="instructions">${recipe.instructions}</div>`
    : `<p><a href="${recipe.url}" target="_blank">View Full Instructions</a></p>`}
`; 

    // create the button wrapper for styling (side by side buttons on larger screens)
    detailSection.appendChild(document.createElement("hr")); // add a horizontal line for separation   
    const buttonWrapper = document.createElement("div");
    buttonWrapper.classList.add("recipe-button-group");

    // adding in the favorite button
    const favoriteBtn = document.createElement("button");
    favoriteBtn.textContent = "❤️ Add to Favorites";
    favoriteBtn.classList.add("favorite-button");
    favoriteBtn.onclick = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || []; //use localStorage to store favorites
    const existing = favorites.find(item => item.id === id && item.source === source);
    if (!existing) {
        favorites.push({ id, source, title: recipe.title || recipe.label, image: recipe.image });
        localStorage.setItem("favorites", JSON.stringify(favorites));
        alert("Recipe added to favorites!");
    } else {
        alert("This recipe is already in your favorites.");
    }
  };
    
    const addToGroceryBtn = document.createElement("button");
    addToGroceryBtn.textContent = "🛒 Add Ingredients to Grocery List";
    addToGroceryBtn.classList.add("favorite-button");
    addToGroceryBtn.addEventListener("click", () => {
        const currentList = JSON.parse(localStorage.getItem("groceryList")) || [];
        const updatedList = [...new Set([...currentList, ...ingredients])];
        localStorage.setItem("groceryList", JSON.stringify(updatedList));
        alert("Recipe ingredients added to your grocery list!");
    });

    // add the buttons to the wrapper
    buttonWrapper.appendChild(document.createElement("hr")); // add a horizontal line for separation
    buttonWrapper.appendChild(favoriteBtn);
    buttonWrapper.appendChild(addToGroceryBtn);

    // add the button wrapper to the detail section
    detailSection.appendChild(buttonWrapper);

    // Add recipe related YouTube videos at the bottom
    const youtubeResults = await searchYouTubeVideos((recipe.title || recipe.label) + " recipe");

    if (youtubeResults.length) {
    const youtubeSection = document.createElement("section");
    youtubeSection.innerHTML = `<h3>Related YouTube Tutorials</h3>`;
    youtubeSection.style.marginTop = "2rem";
    youtubeResults.forEach(video => {
        const { videoId } = video.id;
        const iframe = document.createElement("iframe");
        iframe.width = 300;
        iframe.height = 200;
        iframe.src = `https://www.youtube.com/embed/${videoId}`;
        iframe.title = video.snippet.title;
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        iframe.allowFullscreen = true;
        iframe.style.margin = "1rem";

        youtubeSection.appendChild(iframe);
    });

        detailSection.appendChild(youtubeSection);
        }
    }
  } catch (err) {
    console.error(err);
    detailSection.innerHTML = "<p>Error: ❌ Unable to fetch recipe details. Please try again later.</p>";
  }

  // Back button
  const backButton = document.createElement("button");
  backButton.textContent = "← Back to Search Results";
  backButton.classList.add("back-button");
  backButton.onclick = () => {
    window.history.back();
  };
  detailSection.appendChild(backButton);
});
