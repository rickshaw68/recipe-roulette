export function saveIngredients(ingredientList) {
    localStorage.setItem("recipe-ingredients", JSON.stringify(ingredientList));
}

export function loadIngredients() {
    return JSON.parse(localStorage.getItem("recipe-ingredients")) || [];
}