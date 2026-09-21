export type Meal = {
  id: number;
  name: string;
  description: string;
  ingredients: string[];
  cookingTime: number;
  cost: number;
  protein: number;
  carbs: number;
  fat: number;
};

export const meals: Meal[] = [
  {
    id: 1,
    name: "Chicken & Broccoli Rice Bowl",
    description: "A simple rice bowl with chicken and fresh broccoli.",
    ingredients: ["chicken", "rice", "broccoli"],
    cookingTime: 20,
    cost: 6.5,
    protein: 35,
    carbs: 45,
    fat: 12,
  },

  {
    id: 2,
    name: "Chicken Tacos",
    description: "Chicken tacos with cheese and fresh vegetables.",
    ingredients: ["chicken", "tortilla", "cheese", "lettuce"],
    cookingTime: 15,
    cost: 5.5,
    protein: 30,
    carbs: 38,
    fat: 14,
  },

  {
    id: 3,
    name: "Chicken Stir Fry",
    description: "Chicken and vegetables served over rice.",
    ingredients: ["chicken", "broccoli", "rice", "carrot"],
    cookingTime: 25,
    cost: 7,
    protein: 34,
    carbs: 42,
    fat: 11,
  },

  {
    id: 4,
    name: "Turkey Sandwich",
    description: "Turkey, cheese, lettuce, and tomato on bread.",
    ingredients: ["turkey", "bread", "cheese", "lettuce", "tomato"],
    cookingTime: 10,
    cost: 4.5,
    protein: 25,
    carbs: 35,
    fat: 10,
  },

  {
    id: 5,
    name: "Vegetable Rice Bowl",
    description: "Rice with broccoli, carrots, and cheese.",
    ingredients: ["rice", "broccoli", "carrot", "cheese"],
    cookingTime: 15,
    cost: 4,
    protein: 12,
    carbs: 48,
    fat: 9,
  },
];
