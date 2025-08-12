const ALLERGENS = [
    "peanut", "tree nut", "milk", "egg", "soy",
    "wheat", "gluten", "shellfish", "fish", "sesame"
];

export function detectAllergies(ingredients: string[]): string[] {
    const lowerIngredients = ingredients.map(i => i.toLowerCase());
    return ALLERGENS.filter(allergen =>
    lowerIngredients.some(ing => ing.includes(allergen))
    );
}

export { ALLERGENS };