import { searchRecipesByIngredients } from "./api/spoonacular.mjs";
import { searchEdamamRecipes } from "./api/edamam.mjs";
import { searchYouTubeVideos } from "./api/youtube.mjs";
import { saveIngredients, loadIngredients } from "./utils.mjs";

function createRecipeCard(title, image, link = null) {
  const card = document.createElement("div");
  card.classList.add("recipe-card");
  card.innerHTML = `
    <h3>${title}</h3>
    <img src="${image}" alt="${title}" width="200" />
    ${link ? `<p><a href="${link}" target="_blank" class="recipe-link">View Full Recipe</a></p>` : ""}
  `;
  return card;
}

document.addEventListener("DOMContentLoaded", async () => {
  // 🌿 Ingredient Input Form Setup
  const form = document.getElementById("add-ingredient-form");
  const input = document.getElementById("ingredient-input");
  const list = document.getElementById("ingredient-list");
  const searchBtn = document.getElementById("search-btn");

  let ingredients = loadIngredients();

  // 🔁 Load existing ingredients from localStorage
  ingredients.forEach(value => {
    const li = document.createElement("li");
    li.textContent = value;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "✖";
    removeBtn.style.marginLeft = "1rem";
    removeBtn.onclick = () => {
      ingredients = ingredients.filter(i => i !== value);
      saveIngredients(ingredients);
      li.remove();
    };

    li.appendChild(removeBtn);
    list.appendChild(li);
  });

  // ➕ Handle new ingredient submission
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = input.value.trim().toLowerCase();

    if (!value) {
      alert("Please enter an ingredient.");
      return;
    }

    if (ingredients.includes(value)) {
      alert("You already added that ingredient.");
      return;
    }

    ingredients.push(value);
    saveIngredients(ingredients);

    const li = document.createElement("li");
    li.textContent = value;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "✖";
    removeBtn.style.marginLeft = "1rem";
    removeBtn.onclick = () => {
      ingredients = ingredients.filter(i => i !== value);
      saveIngredients(ingredients);
      li.remove();
    };

    li.appendChild(removeBtn);
    list.appendChild(li);
    input.value = "";
  });

  // 🔍 Perform Recipe Search on Button Click
  searchBtn.addEventListener("click", async () => {
    if (ingredients.length === 0) {
      alert("Please add at least one ingredient.");
      return;
    }

    const query = ingredients.join(",");    

    // 🍲 Spoonacular
    const recipes = await searchRecipesByIngredients(query);
    const container = document.createElement("div");
    container.id = "spoonacular-results";
    container.innerHTML = `<h2>Top Recipe Results (Spoonacular):</h2>`;
    recipes.forEach(recipe => {
        const card = createRecipeCard(recipe.title, recipe.image, recipe.sourceUrl);

    container.appendChild(card);
    });
    const resultsContainer = document.getElementById("results");    
    if (!resultsContainer) {
    console.error("❌ Missing #results element in the HTML!");
    return;
    }
    resultsContainer.innerHTML = ""; // Clear previous search results
  
    resultsContainer.appendChild(container);


    // 🥗 Edamam
    const edamamResults = await searchEdamamRecipes(query);
    const edamamContainer = document.createElement("div");
    edamamContainer.id = "edamam-results";
    edamamContainer.innerHTML = `<h2>Edamam Recipes:</h2>`;
    edamamResults.forEach(hit => {
        const recipe = hit.recipe;
        const card = createRecipeCard(recipe.label, recipe.image, recipe.url);
        edamamContainer.appendChild(card);
    });
    resultsContainer.appendChild(edamamContainer);

    // 🎥 YouTube
    const youtubeResults = await searchYouTubeVideos(query + " recipe");
    const youtubeContainer = document.createElement("div");
    youtubeContainer.id = "youtube-results";
    youtubeContainer.innerHTML = `<h2>YouTube Tutorials:</h2>`;
    youtubeResults.forEach(video => {
      const { videoId } = video.id;
      const { title } = video.snippet;

      const iframe = document.createElement("iframe");
      iframe.width = 300;
      iframe.height = 200;
      iframe.src = `https://www.youtube.com/embed/${videoId}`;
      iframe.title = title;
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;

      youtubeContainer.appendChild(iframe);
    });
    resultsContainer.appendChild(youtubeContainer);
  });
});
