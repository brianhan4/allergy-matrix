import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { detectAllergies } from "../utils/allergyDetection";

export default function AddMenuItem() {
    const [name, setName] = useState("");
    const [ingredientsText, setIngredientsText] = useState("");

    async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ingredients = ingredientsText.split(",").map(i => i.trim());
    const detectedAllergies = detectAllergies(ingredients);

    await addDoc(collection(db, "menuItems"), {
        name,
        ingredients,
        detectedAllergies,
        createdAt: serverTimestamp()
    });

    setName("");
    setIngredientsText("");
    }

    return (
    <form onSubmit={handleSubmit}>
        <input
        placeholder="Dish name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
        />
        <textarea
        placeholder="Ingredients (comma separated)"
        value={ingredientsText}
        onChange={e => setIngredientsText(e.target.value)}
        required
        />
    <button type="submit">Add Item</button>
    </form>
    );
}