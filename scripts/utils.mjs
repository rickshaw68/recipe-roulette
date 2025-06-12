export function loadIngredients() {
  return JSON.parse(localStorage.getItem("ingredients")) || [];
}

export function saveIngredients(ingredientArray) {
  if (!ingredientArray || ingredientArray.length === 0) {
    localStorage.removeItem("ingredients"); // Clear the storage if the array is empty
  } else {
    localStorage.setItem("ingredients", JSON.stringify(ingredientArray));
  }
}
