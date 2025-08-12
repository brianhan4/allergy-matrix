import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { ALLERGENS, detectAllergies } from "../utils/allergyDetection";
import type { MenuItem, MenuItemWithAllergies } from "../types";

export default function MenuList() {
  // store derived items (base data + computed allergies)
  const [items, setItems] = useState<MenuItemWithAllergies[]>([]);
  const [selectedAllergies, setselectedAllergies] = useState<string[]>([]);

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
    if (!selectedAllergies) return true;
    return !selectedAllergies.some((allergy) =>
    (item.detectedAllergies || []).includes(allergy)
  )
  });

  return (
    <section>
      <h2>Menu</h2>

      <div>
          {ALLERGENS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() =>
                setselectedAllergies((prev) =>
                  prev.includes(a)
                    ? prev.filter((al) => al !== a)
                    : [...prev, a]
                )
              }
            >
              {a} {selectedAllergies.includes(a) ? "✓" : ""}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setselectedAllergies([])}
            disabled={selectedAllergies.length === 0}
          >
            No filter
          </button>
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