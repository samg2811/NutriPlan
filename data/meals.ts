export type Ingredient = {
  name: string;
  grams: number;
  fdcId?: number; // optional: pin to a specific USDA food if the auto-search picks the wrong match
};

export type Meal = {
  id: number;
  name: string;
  description: string;
  ingredients: Ingredient[];
  cookingTime: number;
  cost: number;
};

export const meals: Meal[] = [
  {
    id: 1,
    name: "Chicken & Broccoli Rice Bowl",
    description: "A simple rice bowl with chicken and fresh broccoli.",
    ingredients: [
      { name: "chicken breast", grams: 150 },
      { name: "broccoli", grams: 120 },
      { name: "white rice", grams: 100 },
    ],
    cookingTime: 20,
    cost: 6.5,
  },
  {
    id: 2,
    name: "Chicken Tacos",
    description: "Chicken tacos with cheese and fresh vegetables.",
    ingredients: [
      { name: "chicken breast", grams: 130 },
      { name: "corn tortilla", grams: 60 },
      { name: "cheddar cheese", grams: 30 },
      { name: "lettuce", grams: 40 },
    ],
    cookingTime: 15,
    cost: 5.5,
  },
  {
    id: 3,
    name: "Chicken Stir Fry",
    description: "Chicken and vegetables served over rice.",
    ingredients: [
      { name: "chicken breast", grams: 140 },
      { name: "broccoli", grams: 100 },
      { name: "white rice", grams: 100 },
      { name: "carrot", grams: 50 },
    ],
    cookingTime: 25,
    cost: 7,
  },
  {
    id: 4,
    name: "Turkey Sandwich",
    description: "Turkey, cheese, lettuce, and tomato on bread.",
    ingredients: [
      { name: "turkey breast", grams: 90 },
      { name: "whole wheat bread", grams: 60 },
      { name: "cheddar cheese", grams: 20 },
      { name: "lettuce", grams: 20 },
      { name: "tomato", grams: 30 },
    ],
    cookingTime: 10,
    cost: 4.5,
  },
  {
    id: 5,
    name: "Vegetable Rice Bowl",
    description: "Rice with broccoli, carrots, and cheese.",
    ingredients: [
      { name: "white rice", grams: 120 },
      { name: "broccoli", grams: 100 },
      { name: "carrot", grams: 60 },
      { name: "cheddar cheese", grams: 30 },
    ],
    cookingTime: 15,
    cost: 4,
  },
];
