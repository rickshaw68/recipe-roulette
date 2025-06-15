import { searchRecipesByIngredients } from "./api/spoonacular.mjs";
import { searchEdamamRecipes } from "./api/edamam.mjs";
import { searchYouTubeVideos } from "./api/youtube.mjs";
import { saveIngredients, loadIngredients } from "./utils.mjs";
import { setupRecipeRoulette } from "./roulette.js";

function createRecipeCard(title, image, id = null, source = null) {
  const card = document.createElement("div");
  card.classList.add("recipe-card");

  let linkHTML = "";
  if (id && source) {
    const encodedId = encodeURIComponent(id);
    linkHTML = `<p><a href="recipe.html?id=${encodedId}&source=${source}" class="recipe-link">View Full Recipe</a></p>`;
  }

  card.innerHTML = `
    <h3>${title}</h3>
    <img src="${image}" alt="${title}" width="200" />
    ${linkHTML}
  `;
  return card;
}

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("add-ingredient-form");
  const input = document.getElementById("ingredient-input");
  const list = document.getElementById("ingredient-list");
  const searchBtn = document.getElementById("search-btn");
  const clearBtn = document.getElementById("clear-ingredients");
  const clearAllBtn = document.getElementById("clear-all");

  let ingredients = loadIngredients();

  clearBtn.addEventListener("click", () => {
    ingredients = [];
    saveIngredients(ingredients);
    list.innerHTML = "";
  });

  clearAllBtn.addEventListener("click", () => {
    ingredients = [];
    saveIngredients([]);
    list.innerHTML = "";
    // commenting out the localStorage clear to keep previous results due to API limitations
    //localStorage.removeItem("spoonacularResults"); 
    //localStorage.removeItem("edamamResults");
    //localStorage.removeItem("youtubeResults");
    //localStorage.removeItem("lastQuery");
    localStorage.removeItem("filters");
    document.getElementById("results").innerHTML = "";
    document.getElementById("diet-filter").value = "";
    document.getElementById("cuisine-filter").value = "";
    document.getElementById("time-filter").value = "";
    input.value = "";
  });

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

  const savedSpoonacular = JSON.parse(localStorage.getItem("spoonacularResults") || "[]");
  const savedEdamam = JSON.parse(localStorage.getItem("edamamResults") || "[]");
  const savedYouTube = JSON.parse(localStorage.getItem("youtubeResults") || "[]");

  if (savedSpoonacular.length || savedEdamam.length || savedYouTube.length) {
    const resultsContainer = document.getElementById("results");
    resultsContainer.innerHTML = "";

    if (savedSpoonacular.length) {
      const container = document.createElement("div");
      container.id = "spoonacular-results";
      container.innerHTML = `<h2>Previous Results (Spoonacular):</h2>`;
      savedSpoonacular.forEach(recipe => {
        const card = createRecipeCard(recipe.title, recipe.image, recipe.id, "spoonacular");
        container.appendChild(card);
      });
      resultsContainer.appendChild(container);
    }

    if (savedEdamam.length) {
      const container = document.createElement("div");
      container.id = "edamam-results";
      container.innerHTML = `<h2>Previous Results (Edamam):</h2>`;
      savedEdamam.forEach(hit => {
        const recipe = hit.recipe;
        const card = createRecipeCard(recipe.label, recipe.image, recipe.uri, "edamam");
        container.appendChild(card);
      });
      resultsContainer.appendChild(container);
    }

    if (savedYouTube.length) {
      const youtubeContainer = document.createElement("div");
      youtubeContainer.id = "youtube-results";
      youtubeContainer.innerHTML = `<h2>YouTube Tutorials:</h2>`;

      savedYouTube.forEach(video => {
        const { videoId } = video.id;
        const { title, thumbnails } = video.snippet;

        const card = document.createElement("div");
        card.classList.add("recipe-card");
        card.innerHTML = `
          <h3>${title}</h3>
          <img src="${thumbnails.medium.url}" alt="${title}" width="300" />
          <p><a href="recipe.html?id=${videoId}&source=youtube" class="recipe-link">View Tutorial</a></p>
        `;

        youtubeContainer.appendChild(card);
      });

      resultsContainer.appendChild(youtubeContainer);
    }

    resultsContainer.scrollIntoView({ behavior: "smooth" });
  }

  searchBtn.addEventListener("click", async () => {
    const diet = document.getElementById("diet-filter").value;
    const cuisine = document.getElementById("cuisine-filter").value;
    const maxTime = document.getElementById("time-filter").value;

    if (ingredients.length === 0) {
      alert("Please add at least one ingredient.");
      return;
    }

    const query = ingredients.join(",");
    const resultsContainer = document.getElementById("results");
    resultsContainer.innerHTML = "";

    const recipes = await searchRecipesByIngredients(query, diet, cuisine, maxTime);
    const container = document.createElement("div");
    container.id = "spoonacular-results";
    container.innerHTML = `<h2>Top Recipe Results (Spoonacular):</h2>`;
    recipes.forEach(recipe => {
      const card = createRecipeCard(recipe.title, recipe.image, recipe.id, "spoonacular");
      container.appendChild(card);
    });
    resultsContainer.appendChild(container);

    const edamamResults = await searchEdamamRecipes(query, diet, cuisine, maxTime);
    const edamamContainer = document.createElement("div");
    edamamContainer.id = "edamam-results";
    edamamContainer.innerHTML = `<h2>Edamam Recipes:</h2>`;
    edamamResults.forEach(hit => {
      const recipe = hit.recipe;
      const card = createRecipeCard(recipe.label, recipe.image, recipe.uri, "edamam");
      edamamContainer.appendChild(card);
    });
    resultsContainer.appendChild(edamamContainer);

    const youtubeResults = await searchYouTubeVideos(query + " recipe");
    localStorage.setItem("youtubeResults", JSON.stringify(youtubeResults));

    const youtubeContainer = document.createElement("div");
    youtubeContainer.id = "youtube-results";
    youtubeContainer.innerHTML = `<h2>YouTube Tutorials:</h2>`;
    youtubeResults.forEach(video => {
      const { videoId } = video.id;
      const { title, thumbnails } = video.snippet;

      const card = document.createElement("div");
      card.classList.add("recipe-card");
      card.innerHTML = `
        <h3>${title}</h3>
        <img src="${thumbnails.medium.url}" alt="${title}" width="300" />
        <p><a href="recipe.html?id=${videoId}&source=youtube" class="recipe-link">View Tutorial</a></p>
      `;

      youtubeContainer.appendChild(card);
    });
    resultsContainer.appendChild(youtubeContainer);

    localStorage.setItem("spoonacularResults", JSON.stringify(recipes));
    localStorage.setItem("edamamResults", JSON.stringify(edamamResults));
    localStorage.setItem("lastQuery", query);
  });
  setupRecipeRoulette();
});
