export interface MenuItem {
    id: string;
    name: string;
    ingredients: string[];
    allergies?: string[]; // detected allergies
}

export type MenuItemWithAllergies = MenuItem & {
    detectedAllergies: string[];
};