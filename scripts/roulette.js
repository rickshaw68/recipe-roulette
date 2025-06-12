export function setupRecipeRoulette() {
  const spinButton = document.getElementById("spin-recipe-btn");
  const spinner = document.getElementById("spinner");
  const resultContainer = document.getElementById("roulette-result");
  const messageEl = document.getElementById("spin-message");

  spinButton.addEventListener("click", () => {
    const spoonacular = JSON.parse(localStorage.getItem("spoonacularResults") || "[]");
    const edamam = JSON.parse(localStorage.getItem("edamamResults") || "[]");

    const combined = [
      ...spoonacular.map(r => ({
        title: r.title,
        image: r.image,
        id: r.id,
        source: "spoonacular"
      })),
      ...edamam.map(hit => ({
        title: hit.recipe.label,
        image: hit.recipe.image,
        id: hit.recipe.uri,
        source: "edamam"
      }))
    ];

    // clear previous messages if there are any
    messageEl.textContent = "";

    // error message if no recipes available
    if (combined.length === 0) {
      messageEl.textContent = "⚠️ No recipes available. Please search using ingredients first.";
      return;
    }

    // Reset state
    resultContainer.innerHTML = "";
    spinner.classList.remove("spinner-animate");
    void spinner.offsetWidth; // trick to restart animation
    const sound = document.getElementById("spin-sound");
    if (sound) sound.play();
    spinner.classList.add("spinner-animate");

    // Delay result reveal until spin completes
    setTimeout(() => {
      const selected = combined[Math.floor(Math.random() * combined.length)];

      const card = document.createElement("div");
      card.classList.add("recipe-card");
      card.innerHTML = `
        <h3>${selected.title}</h3>
        <img src="${selected.image}" alt="${selected.title}" width="200" />
        <p><a href="recipe.html?id=${encodeURIComponent(selected.id)}&source=${selected.source}" class="recipe-link">View Full Recipe</a></p>
      `;

      resultContainer.appendChild(card);
      resultContainer.scrollIntoView({ behavior: "smooth" });
    }, 3000); // Wait for spin to finish
  });
}
