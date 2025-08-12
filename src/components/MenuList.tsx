import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { ALLERGENS, detectAllergies } from "../utils/allergyDetection";
import type { MenuItem, MenuItemWithAllergies } from "../types";

export default function MenuList() {
  // store derived items (base data + computed allergies)
  const [items, setItems] = useState<MenuItemWithAllergies[]>([]);
  const [selectedAllergy, setSelectedAllergy] = useState<string>("");

  useEffect(() => {
    const q = query(collection(db, "menuItems"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const docs: MenuItemWithAllergies[] = snapshot.docs.map((d) => {
        const base = { id: d.id, ...(d.data() as any) } as MenuItem;
        const withAllergies: MenuItemWithAllergies = {
          ...base,
          detectedAllergies: detectAllergies(base.ingredients || []),
        };
        return withAllergies;
      });
      setItems(docs);
    });
    return () => unsub();
  }, []);

  async function handleDelete(id?: string) {
    if (!id) return;
    try {
      await deleteDoc(doc(db, "menuItems", id));
    } catch (err) {
      console.error("delete failed", err);
    }
  }

  const filtered = items.filter((item) => {
    if (!selectedAllergy) return true;
    return !(item.detectedAllergies || []).includes(selectedAllergy);
  });

  return (
    <section>
      <h2>Menu</h2>

      <div>
        <label htmlFor="filter">Filter by allergy: </label>
        <select
          id="filter"
          value={selectedAllergy}
          onChange={(e) => setSelectedAllergy(e.target.value)}
        >
          <option value="">No filter</option>
          {ALLERGENS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      <ul>
        {filtered.map((it) => (
          <li key={it.id} style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 600 }}>{it.name}</div>
            <div>{(it.ingredients || []).join(", ")}</div>
            {(it.detectedAllergies || []).length > 0 && (
              <div style={{ color: "red" }}>⚠ {it.detectedAllergies.join(", ")}</div>
            )}
            <div style={{ marginTop: 6 }}>
              <button onClick={() => handleDelete(it.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>

      {filtered.length === 0 && <div>No items match.</div>}
    </section>
  );
}