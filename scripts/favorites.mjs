document.addEventListener("DOMContentLoaded", () => {
  const listContainer = document.getElementById("favorites-container");
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  if (favorites.length === 0) {
    listContainer.innerHTML = "<p>You haven't added any favorites yet.</p>";
    return;
  }

  favorites.forEach(recipe => {
    const card = document.createElement("div");
    card.classList.add("recipe-card");

    card.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.title}" />
      <h3>${recipe.title}</h3>
      <a href="recipe.html?id=${encodeURIComponent(recipe.id)}&source=${recipe.source}" class="recipe-link">View Recipe</a>
      <button class="remove-button" data-id="${recipe.id}" data-source="${recipe.source}">🗑 Remove</button>
    `;

    listContainer.appendChild(card);
  });

  listContainer.addEventListener("click", e => {
    if (e.target.classList.contains("remove-button")) {
      const id = e.target.dataset.id;
      const source = e.target.dataset.source;

      const updatedFavorites = favorites.filter(
        fav => !(fav.id === id && fav.source === source)
      );
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      e.target.closest(".recipe-card").remove();
        if (updatedFavorites.length === 0) {
            listContainer.innerHTML = "<p>You haven't added any favorites yet.</p>";
        }
    }
  });
});
