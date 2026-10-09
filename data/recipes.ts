// Step-by-step instructions for each meal, keyed by meal id (see data/meals.ts).
// Seasonings such as salt, pepper, or spices are not tracked as ingredients.

export const recipes: Record<number, string[]> = {
  1: ["Cook the rice per package directions.", "Season the chicken and pan-sear 5-6 min per side until cooked through; slice.", "Steam or sauté the broccoli 4-5 min until tender-crisp.", "Serve the rice topped with chicken and broccoli."],
  2: ["Season the chicken and cook in a skillet 5-6 min per side; shred or slice.", "Warm the tortillas in a dry pan, 30 sec per side.", "Fill with chicken, lettuce, and cheddar."],
  3: ["Cook the rice per package directions.", "Stir-fry sliced chicken in a hot pan 5-6 min until cooked through.", "Add the broccoli and carrot; stir-fry 4-5 min until tender-crisp.", "Serve over the rice."],
  4: ["Toast the bread if you like.", "Layer turkey, cheddar, lettuce, and tomato on one slice.", "Top with the second slice and cut in half."],
  5: ["Cook the rice per package directions.", "Steam the broccoli and carrot 5-6 min until tender.", "Top the rice with the vegetables and sprinkle with cheddar."],
  6: ["Melt half the butter in a nonstick pan over medium-low heat.", "Whisk the eggs with a pinch of salt, add to the pan, and stir gently until just set.", "Toast the bread, spread with the remaining butter, and serve with the eggs."],
  7: ["Stir the oats, milk, and honey together in a jar.", "Cover and refrigerate at least 4 hours or overnight.", "Top with sliced banana before eating."],
  8: ["Slice the strawberries.", "Layer the yogurt, strawberries, and blueberries in a glass.", "Drizzle with honey."],
  9: ["Toast the bread until golden.", "Spread with peanut butter.", "Top with sliced banana."],
  10: ["Preheat the oven to 400°F (200°C).", "Toss cubed sweet potato with half the oil and salt; roast 15 min.", "Add the salmon, brush with the remaining oil, and roast 12-15 min until it flakes.", "Serve together."],
  11: ["Cook the quinoa per package directions.", "Sauté the sliced bell pepper in the oil 3-4 min.", "Add the shrimp and cook 2-3 min per side until pink.", "Serve over the quinoa."],
  12: ["Cook the rice per package directions.", "Brown the ground beef 6-8 min over medium-high heat; drain the fat.", "Add the broccoli and stir-fry 4-5 min.", "Serve over the rice."],
  13: ["Cook the pasta in salted boiling water until al dente; drain.", "Brown the beef with the diced onion 7-8 min.", "Add the chopped tomato and simmer 8-10 min.", "Toss with the pasta."],
  14: ["Cook the rice per package directions.", "Warm the black beans in a small pot 5 min.", "Dice the tomato and slice the avocado.", "Assemble the bowl."],
  15: ["Drain and rinse the chickpeas.", "Dice the cucumber and tomato; chop the spinach.", "Toss everything with the olive oil, salt, and pepper."],
  16: ["Cook the rice per package directions.", "Press and cube the tofu; pan-fry until golden, about 8 min.", "Add the bell pepper and broccoli; stir-fry 4-5 min.", "Serve over the rice."],
  17: ["Preheat the oven to 400°F (200°C).", "Toss cubed sweet potato with half the oil; roast 20 min.", "Season the pork chop and sear in the remaining oil 4-5 min per side until cooked through.", "Rest 3 min and serve with the sweet potato."],
  18: ["Drain and flake the tuna into a bowl.", "Toast the bread if desired.", "Pile the tuna on one slice, add lettuce and tomato, and top with the second slice."],
  19: ["Slice the strawberries.", "Spoon the cottage cheese into a bowl.", "Top with the strawberries and blueberries."],
  20: ["Season the chicken and grill or pan-sear 5-6 min per side; slice.", "Chop the kale, discarding stems, and massage with the oil for 1 min.", "Top the kale with chicken and shaved parmesan."],
  21: ["Spiralize the zucchini into noodles.", "Sauté the minced garlic in the oil for 30 sec.", "Add the shrimp; cook 2-3 min per side until pink.", "Toss in the zucchini noodles 1-2 min until warm."],
  22: ["Pulse the cauliflower in a food processor until rice-sized.", "Scramble the egg in a hot pan; set aside.", "Sauté the cauliflower and diced carrot 5-6 min until tender.", "Stir the egg back in and season."],
  23: ["Cook the bacon over medium heat 6-8 min until crisp; drain.", "Pour off most of the fat and scramble the eggs in the pan over low heat.", "Serve together."],
  24: ["Cook the brown rice per package directions.", "Bake or pan-sear the salmon 10-12 min; flake it.", "Wilt the spinach in a warm pan 1 min.", "Top the rice with spinach and salmon."],
  25: ["Add the milk, banana, and almond butter to a blender.", "Blend until smooth.", "Pour and serve immediately."],
  26: ["Slice the mozzarella and tomato.", "Arrange in alternating layers on a plate.", "Drizzle with the olive oil; season with salt and pepper."],
  27: ["Cook the quinoa per package directions; let cool slightly.", "Rinse the black beans; dice the bell pepper and avocado.", "Toss together gently and season."],
  28: ["Slice the apple.", "Arrange with the almonds on a plate.", "Drizzle with honey."],
  29: ["Cook the quinoa per package directions.", "Grill or pan-sear the seasoned chicken 5-6 min per side; slice.", "Slice the avocado and chop the spinach.", "Build the bowl."],
  30: ["Peel the orange and separate the segments.", "Spoon the yogurt into a bowl.", "Top with orange and honey."],
  31: ["Brown the turkey with the diced onion 6-8 min.", "Add the chopped tomato, drained black beans, a splash of water, and chili seasoning.", "Simmer 20 min, stirring occasionally, until thick."],
  32: ["Brown the beef 6-8 min, seasoning as it cooks; drain the fat.", "Warm the tortillas in a dry pan, 30 sec per side.", "Fill with beef, lettuce, and cheddar."],
  33: ["Sauté the diced bell pepper and mushroom 3-4 min.", "Add the spinach until wilted.", "Pour in the egg whites, cook until set, then fold and serve."],
  34: ["Preheat the oven to 400°F (200°C).", "Toss cubed sweet potato with half the oil; roast 20-25 min.", "Season the steak and sear in the remaining oil 3-5 min per side.", "Rest 5 min, slice, and serve."],
  35: ["Preheat the oven to 400°F (200°C).", "Place the cod and trimmed asparagus on a sheet pan; drizzle with oil and season.", "Bake 12-15 min until the cod flakes."],
  36: ["Cook the pasta until al dente; drain.", "Grill or pan-sear the chicken 5-6 min per side; slice.", "Chop the basil with the parmesan into a quick pesto and toss with the pasta.", "Top with the chicken."],
  37: ["Drain and rinse the chickpeas.", "Dice the cucumber and crumble the feta.", "Combine in a bowl with the olive oil."],
  38: ["Sauté the diced onion and carrot in the oil 5 min.", "Add the rinsed lentils and enough water to cover by 1-2 inches.", "Simmer 20-25 min until tender; season."],
  39: ["Preheat the oven to 400°F (200°C). Season the turkey and roll into meatballs.", "Bake 15-18 min until cooked through.", "Cook the pasta; simmer the chopped tomato into a quick sauce.", "Serve the meatballs over pasta with sauce."],
  40: ["Sauté the shrimp 2-3 min per side until pink.", "Warm the tortillas in a dry pan.", "Fill with shrimp and shredded cabbage; squeeze lime on top."],
  41: ["Preheat the oven to 425°F (220°C).", "Season the thighs and bake 25-30 min until they reach 165°F (74°C).", "Cook the rice per package directions and serve alongside."],
  42: ["Sauté the sliced mushroom 3 min; add the spinach until wilted.", "Pour in the whisked eggs; cook over medium-low heat until nearly set.", "Add cheddar, fold, and serve."],
  43: ["Cut the cucumber, carrot, and bell pepper into sticks.", "Spoon the hummus onto a plate.", "Arrange the vegetables around it."],
  44: ["Butter one side of each bread slice; put the cheddar between the unbuttered sides.", "Grill 3-4 min per side until golden and melted.", "Serve with sliced tomato."],
  45: ["Cook the rice per package directions.", "Slice the chicken, bell pepper, and onion into strips.", "Sauté the chicken 5-6 min, add the vegetables, and cook 4-5 min more.", "Serve over rice with a squeeze of lime."],
  46: ["Preheat the oven to 400°F (200°C).", "Place the salmon and trimmed asparagus on a sheet pan; drizzle with oil and season.", "Bake 12-15 min until the salmon flakes."],
  47: ["Slice or mash the avocado.", "Layer the turkey, avocado, and lettuce on the wrap.", "Roll tightly and cut in half."],
  48: ["Toast the bread.", "Fry the egg 2-3 min until the white is set.", "Mash the avocado onto the toast, top with the egg, and season."],
  49: ["Cook the rice per package directions.", "Slice the steak thinly and stir-fry over high heat 2-3 min; set aside.", "Stir-fry the pepper and onion 4 min, then return the beef.", "Serve over the rice."],
  50: ["Cook the quinoa; let cool slightly.", "Dice the cucumber and tomato; crumble the feta.", "Toss together and season."],
  51: ["Simmer the chicken in water 15 min until cooked; shred.", "Add the sliced carrot and diced onion; simmer 5 min.", "Add the pasta and cook until tender; return the chicken to the pot."],
  52: ["Grill or pan-sear the shrimp 2-3 min per side until pink.", "Toss the spinach and tomato with the oil.", "Top with the shrimp."],
  53: ["Preheat the oven to 400°F (200°C).", "Bake the seasoned tilapia with the oil 10-12 min until it flakes.", "Cook the rice per package directions and serve with the fish."],
  54: ["Cook the pasta until al dente; drain.", "Sear the seasoned chicken 5-6 min per side; slice.", "Warm the milk, whisk in the parmesan until smooth and slightly thick.", "Toss with the pasta and top with the chicken."],
  55: ["Cook the rice per package directions.", "Warm the black beans and corn together.", "Slice the avocado.", "Build the bowl."],
  56: ["Preheat the oven to 400°F (200°C).", "Rub the pork with half the oil and seasoning; sear 2 min per side, then roast 15-20 min until 145°F (63°C).", "Toss the green beans with the remaining oil and roast alongside for the last 12 min.", "Rest the pork 5 min, slice, and serve."],
  57: ["Grill or pan-sear the seasoned chicken 5-6 min per side; slice.", "Toast the bread.", "Layer chicken, mozzarella, and tomato between the bread."],
  58: ["Preheat the oven to 400°F (200°C). Pierce the sweet potato and bake 45 min (or microwave 8-10 min).", "Warm the black beans.", "Split the potato, top with beans and cheddar, and let the cheese melt."],
  59: ["Grill or pan-sear the seasoned chicken 5-6 min per side; slice.", "Warm the tortilla so it's pliable.", "Fill with chicken, lettuce, and parmesan; roll tightly."],
  60: ["Scramble the egg in a hot pan; set aside.", "Stir-fry the diced carrot and peas 3-4 min.", "Add the cooked rice; stir-fry 3 min, then fold the egg back in."],
  61: ["Brown the beef 6-8 min; drain the fat.", "Stir in the black beans and heat through.", "Fill the warmed tortilla with the beef mixture and cheddar; roll up."],
  62: ["Sauté the small-diced sweet potato 8-10 min until starting to soften.", "Add the onion and turkey; cook 8-10 min, breaking up the turkey, until cooked through and the potato is tender."],
  63: ["Cook the rice; let cool slightly.", "Cube the sushi-grade salmon (or use cooked salmon).", "Slice the cucumber and avocado.", "Assemble over the rice."],
  64: ["Dice the chicken, sweet potato, and onion.", "Cook the sweet potato in a skillet 8 min, then add the chicken and onion.", "Cook 8-10 min more, stirring, until the chicken is done and the potato is tender."],
  65: ["Preheat the oven to 375°F (190°C).", "Cook the pasta slightly under al dente; drain.", "Mix with the chopped tomato and half the mozzarella in a baking dish; top with the rest.", "Bake 20-25 min until bubbly."],
  66: ["Brown the turkey 6-8 min.", "Add the diced carrot and bell pepper; cook 4-5 min.", "Spoon into lettuce leaves."],
  67: ["Preheat the oven to 400°F (200°C).", "Pound the chicken flat, season, and sear 3 min per side.", "Top with sliced tomato and mozzarella; bake 15-18 min until cooked through."],
  68: ["Scramble the egg; set aside.", "Stir-fry the shrimp 2-3 min until pink; set aside.", "Stir-fry the peas and cooked rice 3 min.", "Return the egg and shrimp; toss."],
  69: ["Preheat the oven to 375°F (190°C).", "Sauté the bell pepper and spinach in an oven-safe pan 3 min.", "Pour in the whisked eggs, add parmesan, and cook 2 min.", "Bake 12-15 min until set."],
  70: ["Sear the seasoned chicken in the oil 5-6 min per side; slice.", "Sauté the mushrooms and onion in the same pan 5-6 min.", "Return the chicken and toss."],
  71: ["Slow-cook the pork shoulder, covered, 3-4 hours until it shreds.", "Shred and toss with BBQ sauce.", "Pile onto the bread."],
  72: ["Preheat the oven to 400°F (200°C).", "Put the seasoned chicken and green beans on a sheet pan; drizzle with oil.", "Bake 20-25 min until the chicken reaches 165°F (74°C)."],
  73: ["Cook the noodles per package directions; drain.", "Stir-fry the carrot, bell pepper, and broccoli 5-6 min.", "Toss with the noodles and a splash of soy sauce."],
  74: ["Preheat the oven to 375°F (190°C). Cut the tops off the peppers and remove the seeds.", "Brown the beef 6-8 min and mix with the cooked rice.", "Stuff the peppers and bake 25-30 min until tender."],
  75: ["Cook the bacon until crisp.", "Toast the bread.", "Layer turkey, bacon, lettuce, and tomato; cut in halves."],
  76: ["Cook the rice per package directions.", "Cube and season the chicken; grill or pan-sear 8-10 min, turning, until cooked through.", "Dice the cucumber; crumble the feta.", "Serve over rice with cucumber and feta."],
  77: ["Preheat the oven to 400°F (200°C). Slice the eggplant and bake 15 min until soft.", "Layer with chopped tomato and mozzarella in a dish.", "Bake 15-20 min until bubbly."],
  78: ["Cook the rice per package directions.", "Brown the turkey 6-8 min.", "Add the broccoli and carrot; stir-fry 5 min.", "Serve over the rice."],
  79: ["Simmer the chicken in water 15 min; shred.", "Add the chopped tomato, corn, and onion; simmer 10 min.", "Return the chicken to the pot and season."],
  80: ["Preheat the oven to 400°F (200°C). Season the cod and bake 12-14 min until it flakes.", "Warm the tortillas.", "Flake the cod into the tortillas and top with cabbage."],
  81: ["Preheat the oven to 350°F (175°C) and grease a muffin tin.", "Whisk the eggs; stir in the chopped spinach and feta.", "Pour into the tin and bake 15-18 min until set."],
  82: ["Cook the rice per package directions.", "Sauté the onion 4 min; add cubed chicken and curry powder and cook 6-8 min.", "Add the chickpeas and a splash of water; simmer 10 min.", "Serve over the rice."],
  83: ["Preheat the oven to 425°F (220°C). Cut the sweet potato into fries and roast 25 min, turning once.", "Form the turkey into a patty and season.", "Cook the patty 5-6 min per side and serve on the bread."],
  84: ["Preheat the oven to 400°F (200°C). Season the chicken, roll into meatballs, and bake 15-18 min.", "Cook the pasta until al dente.", "Simmer the chopped tomato into a quick marinara; toss with the meatballs and pasta."],
  85: ["Preheat the oven to 425°F (220°C). Roast the cubed sweet potato and chickpeas 20-25 min.", "Cook the quinoa per package directions.", "Massage the kale with a pinch of salt.", "Build the bowl."],
  86: ["Cook the rice per package directions.", "Brown the beef 6-8 min; drain the fat.", "Warm the black beans.", "Top the rice with beef, beans, and cheddar."],
  87: ["Bake or pan-sear the salmon 10-12 min; flake it.", "Toss the spinach and cucumber with the oil.", "Top with the salmon."],
  88: ["Cook the rice per package directions.", "Cook the chicken with shawarma spices 6-7 min per side; slice.", "Slice the cucumber; thin the yogurt with a little water for a sauce.", "Serve over rice with cucumber and sauce."],
  89: ["Preheat the oven to 375°F (190°C).", "Mix the turkey with seasoning, shape into a loaf, and bake 35-40 min until 165°F (74°C).", "Steam or roast the green beans 8-10 min and serve alongside."],
  90: ["Hard-boil the eggs 10 min, cool in cold water, and peel.", "Chop and season with salt and pepper.", "Spread on the bread, add lettuce, and top with the second slice."],
  91: ["Preheat the oven to 375°F (190°C). Poach or bake the chicken; shred.", "Fill the tortillas with chicken and half the cheddar; roll into a baking dish.", "Top with chopped tomato and the remaining cheddar; bake 20 min."],
  92: ["Preheat the oven to 400°F (200°C).", "Bake the seasoned trout with the oil 12-15 min until it flakes.", "Cook the rice per package directions and serve with the fish."],
  93: ["Cook the rice per package directions.", "Simmer the cauliflower and carrot with curry powder and a little water 12 min.", "Add the chickpeas; cook 5 min more.", "Serve over the rice."],
  94: ["Preheat the oven to 375°F (190°C). Halve the peppers and remove the seeds.", "Brown the turkey 6-8 min; stir in the chopped spinach until wilted.", "Fill the peppers and bake 25-30 min until tender."],
  95: ["Cook the bacon until crisp; crumble.", "Grill or pan-sear the chicken 5-6 min per side; slice.", "Fill the tortilla with chicken, bacon, and lettuce; roll tightly."],
  96: ["Preheat the oven to 400°F (200°C).", "Place the halibut and trimmed asparagus on a sheet pan; drizzle with oil and season.", "Bake 12-15 min until the fish flakes."],
  97: ["Cook the pasta until al dente; drain.", "Brown the turkey 6-8 min; add the chopped tomato, black beans, and chili seasoning.", "Simmer 15 min, then stir in the pasta."],
  98: ["Cook the rice per package directions.", "Cube the chicken; cut the pepper and onion into chunks.", "Thread onto skewers; grill or broil 10-12 min, turning, until the chicken is cooked through.", "Serve with the rice."],
  99: ["Preheat the oven to 400°F (200°C).", "Put the cod and broccoli on a sheet pan; drizzle with oil and season.", "Bake 12-15 min until the cod flakes and the broccoli is tender."],
  100: ["Cook the diced sweet potato in a skillet 8 min.", "Add the turkey and cook 6-8 min.", "Fry or scramble the eggs and serve on top."],
  101: ["Scramble the egg; set aside.", "Stir-fry the diced chicken 5-6 min until cooked through.", "Add the carrot and cooked rice; stir-fry 3-4 min.", "Fold the egg back in."],
  102: [
    "Cook the rice according to package directions.",
    "Season the chicken and pan-sear 5-6 min per side until internal temperature reaches 165°F (74°C), then slice.",
    "Steam or sauté the broccoli for 4-5 min until tender-crisp.",
    "Assemble the rice, chicken, and broccoli in a bowl, then drizzle with simple teriyaki sauce."
  ],
  103: [
    "Cook the rice according to package directions.",
    "In a skillet over medium heat, brown the ground turkey until fully cooked (6-8 min), seasoning to taste.",
    "Dice or shred the carrot and sauté or steam until tender.",
    "Serve the ground turkey and carrot over a bed of warm rice."
  ],
  104: [
    "Boil the pasta in salted water according to package directions; drain.",
    "Dice the chicken, season, and pan-sear in a skillet until fully cooked (6-8 min).",
    "Add chopped tomatoes to the skillet and simmer 3-4 min until soft to form a light sauce.",
    "Toss the pasta with the chicken and tomato sauce until well combined."
  ],
  105: [
    "Boil the pasta in salted water according to package directions; drain.",
    "Brown the ground beef in a skillet over medium heat until cooked through; drain excess fat.",
    "Add chopped tomatoes and simmer for 5 min to build the sauce.",
    "Combine the pasta with the beef and tomato sauce and serve."
  ],
  106: [
    "Cook the rice according to package directions.",
    "Season and grill or pan-sear the chicken until fully cooked (5-6 min per side); slice.",
    "Dice or slice the fresh avocado.",
    "Assemble the bowl with a base of rice, topped with sliced chicken and avocado."
  ],
  107: [
    "Cook the rice according to package directions and let cool slightly.",
    "Slice or dice the cucumber and avocado.",
    "Drain the tuna and flake it into bite-sized pieces.",
    "Layer the rice in a bowl and top with tuna, cucumber, and avocado."
  ],
  108: [
    "Pre-cook and shred or dice the chicken.",
    "Place a tortilla in a warm skillet over medium heat, scattering cheese and chicken over one half.",
    "Fold the tortilla over and cook 2-3 min per side until golden brown and the cheese is fully melted.",
    "Slice into wedges and serve warm."
  ],
  109: [
    "Brown and season the ground or sliced beef in a skillet; set aside.",
    "Place a tortilla in a warm skillet and layer cheese and cooked beef on one half.",
    "Fold over and cook for 2-3 min on each side until the exterior is crispy and cheese is melted.",
    "Slice into wedges and serve."
  ],
  110: [
    "Rinse and drain the black beans.",
    "Place a tortilla in a skillet over medium heat, spreading black beans and cheese over one half.",
    "Fold the tortilla in half and cook for 2-3 min per side until the tortilla is golden and cheese is melted.",
    "Remove from heat, slice, and serve."
  ],
  111: [
    "Cook the rice according to package instructions; warm the black beans.",
    "Dice and cook the chicken in a skillet until fully cooked.",
    "Warm the tortilla, then layer rice, black beans, chicken, and cheese down the center.",
    "Fold the sides in, roll tightly into a burrito, and serve."
  ],
  112: [
    "Cook the rice according to package instructions; warm the black beans.",
    "Brown and season the beef in a skillet over medium heat.",
    "Lay the tortilla flat and add rice, black beans, beef, and cheese.",
    "Roll up tightly, seam-side down, and serve warm."
  ],
  113: [
    "Dice and cook the chicken in a skillet; warm the black beans.",
    "Dice the tomato and grate or portion the cheese.",
    "Layer black beans, cooked chicken, diced tomato, and melted cheese in a bowl.",
    "Top with a serving of tortilla chips or serve chips on the side."
  ],
  114: [
    "Brown the ground turkey in a skillet over medium heat with taco seasoning until fully cooked.",
    "Shred the lettuce and dice the tomato.",
    "Warm the tortillas in a pan or microwave.",
    "Divide the ground turkey into tortillas and top with lettuce and tomato."
  ],
  115: [
    "Season the white fish and pan-sear or bake at 400°F (200°C) for 10-12 min until flaky.",
    "Shred the cabbage and dice the tomato.",
    "Warm the tortillas in a skillet.",
    "Flake the fish into tortillas and top with shredded cabbage and diced tomato."
  ],
  116: [
    "Season and cook the chicken in a skillet; slice or dice once done.",
    "Chop the lettuce and place it in a large bowl as the base.",
    "Rinse and drain the black beans, then dice the tomato.",
    "Top the lettuce base with chicken, black beans, tomato, and cheese."
  ],
  117: [
    "Cook the rice according to package directions.",
    "Brown the ground turkey in a skillet with your preferred seasonings.",
    "Rinse black beans, dice the tomato, and slice the avocado.",
    "Assemble the bowl with rice, ground turkey, black beans, tomato, and fresh avocado."
  ],
  118: [
    "Cook the rice according to package directions.",
    "Dice and cook the chicken in a skillet until golden and cooked through.",
    "Warm the black beans and dice the tomato.",
    "Layer the rice, chicken, black beans, and tomato in a serving bowl."
  ],
  119: [
    "Cook the rice according to package directions.",
    "Dice or slice the beef and sauté in a skillet until browned and cooked to desired doneness.",
    "Grate or dice the carrot and sauté briefly until tender.",
    "Serve the cooked beef and carrots over a bed of warm rice."
  ],
  120: [
    "Cook the rice according to package directions.",
    "Season the salmon fillet and bake at 400°F (200°C) for 12-15 min or pan-sear until cooked through.",
    "Thinly slice the cucumber.",
    "Serve the salmon over rice accompanied by cucumber slices."
  ],
  121: [
    "Boil the pasta according to package directions; drain.",
    "Dice the chicken and pan-sear in a skillet until fully cooked.",
    "Add broccoli florets and sliced carrots to the skillet with a splash of water, cooking 4-5 min until tender.",
    "Toss the pasta, chicken, and vegetables together before serving."
  ],
  122: [
    "Boil the pasta according to package directions; drain.",
    "Slice the beef into thin strips; stir-fry in a skillet over high heat until browned.",
    "Add sliced bell pepper and carrots to the skillet; cook for 3-4 min until tender-crisp.",
    "Combine the noodles with the beef and vegetables."
  ],
  123: [
    "Boil the pasta according to package directions; drain.",
    "Sauté the shrimp in a skillet with oil for 2-3 min per side until pink and opaque.",
    "Steam or sauté the broccoli until tender-crisp.",
    "Toss the noodles, shrimp, and broccoli together in a bowl."
  ],
  124: [
    "Season and pan-sear the chicken until fully cooked; slice into strips.",
    "Chop the lettuce and tomato.",
    "Warm or lightly toast the pita pocket.",
    "Stuff the pita with chicken, lettuce, tomato, and spoonfuls of yogurt sauce."
  ],
  125: [
    "Slice or shred the cooked turkey.",
    "Chop the lettuce and tomato.",
    "Warm the pita bread slightly.",
    "Fill the pita pocket with turkey, lettuce, tomato, and yogurt."
  ],
  126: [
    "Bake or pan-fry the falafel according to package instructions until crispy.",
    "Chop the lettuce, tomato, and cucumber.",
    "Warm the pita bread and open the pocket.",
    "Fill with falafel, fresh chopped vegetables, and yogurt sauce."
  ],
  127: [
    "Cook the rice according to package directions.",
    "Season the chicken with Mediterranean herbs and pan-sear until internal temp is 165°F (74°C); slice.",
    "Dice the cucumber and tomato; crumble the feta cheese.",
    "Serve chicken, cucumber, tomato, and feta over the warm rice."
  ],
  128: [
    "Cook the rice according to package directions.",
    "Cook and season the turkey in a skillet until fully browned.",
    "Dice the cucumber and tomato; portion the feta cheese.",
    "Assemble the bowl with rice, turkey, cucumber, tomato, and feta."
  ],
  129: [
    "Cook and slice the chicken breast.",
    "Dice the tomato and cucumber; crumble the feta.",
    "Warm the tortilla slightly for easy rolling.",
    "Layer chicken, tomato, cucumber, and feta in the center, then wrap tightly."
  ],
  130: [
    "Drain the tuna into a salad bowl.",
    "Dice the cucumber and tomato, and wash the fresh spinach.",
    "Add cucumber, tomato, and spinach to the tuna.",
    "Drizzle with olive oil, toss well, and serve."
  ],
  131: [
    "Boil the pasta in salted water according to package directions; drain.",
    "Dice and pan-sear the chicken until fully cooked.",
    "Toss fresh spinach into the warm chicken skillet until wilted.",
    "Combine pasta, chicken, and spinach, then sprinkle with parmesan cheese."
  ],
  132: [
    "Boil the pasta according to package directions; drain.",
    "Brown the ground turkey in a skillet; add chopped tomatoes and simmer for 5 min.",
    "Stir in the spinach during the last 2 minutes of cooking until wilted.",
    "Combine the turkey and spinach sauce with the pasta."
  ],
  133: [
    "Boil the pasta according to package directions; drain.",
    "In a skillet, heat olive oil and cook chopped tomatoes until they break down into a sauce.",
    "Add shrimp to the tomato sauce and cook for 3-4 min until pink.",
    "Toss the pasta directly into the shrimp and tomato sauce."
  ],
  134: [
    "Boil the pasta according to package directions; drain.",
    "Cook the salmon (pan-sear or bake) and flake it into pieces using a fork.",
    "Sauté or wilt the spinach in a skillet.",
    "Toss the pasta, flaked salmon, and spinach together gently."
  ],
  135: [
    "Boil the pasta according to package directions; drain.",
    "In a pan, simmer chopped tomatoes for 5 min until soft.",
    "Drain the tuna and stir it into the tomato sauce along with herbs.",
    "Toss the warm pasta with the tuna-tomato sauce."
  ],
  136: [
    "Boil the pasta according to package directions; drain.",
    "Dice the zucchini, bell pepper, and tomato.",
    "Sauté zucchini and bell pepper in a pan for 5 min, then add tomato and simmer into a sauce.",
    "Combine the cooked vegetables and sauce with the pasta."
  ],
  137: [
    "Boil the pasta according to package directions; drain.",
    "Slice mushrooms and sauté in a skillet until browned (5-6 min).",
    "Add spinach to the skillet and toss until wilted.",
    "Combine pasta with mushrooms and spinach, then top with parmesan cheese."
  ],
  138: [
    "Boil the pasta according to package directions; drain.",
    "Dice the chicken and pan-sear until cooked; slice the mushrooms.",
    "Sauté mushrooms with the chicken until golden brown.",
    "Toss the chicken and mushrooms with the drained pasta."
  ],
  139: [
    "Boil the pasta according to package directions; drain.",
    "Brown the beef in a skillet; add sliced mushrooms and cook until soft.",
    "Drain any excess fat from the skillet.",
    "Mix the beef and mushroom combination into the cooked pasta."
  ],
  140: [
    "Cook the rice according to package directions.",
    "Season and pan-sear the chicken until fully cooked; slice into bite-sized pieces.",
    "Dice the tomato.",
    "Assemble rice and chicken in a bowl, stir in pesto, and top with fresh tomato."
  ],
  141: [
    "Whisk and scramble the eggs in a non-stick skillet over medium heat.",
    "Warm the tortilla in a separate pan or microwave.",
    "Layer scrambled eggs and cheese inside the warm tortilla.",
    "Roll up tightly into a wrap and serve immediately."
  ],
  142: [
    "Scramble the eggs in a skillet until cooked.",
    "Warm or lightly brown the turkey in the skillet.",
    "Place eggs, turkey, and cheese into a warm tortilla.",
    "Wrap tightly and serve warm."
  ],
  143: [
    "Dice the potato, bell pepper, and onion.",
    "Roast or pan-fry potatoes, peppers, and onions in a skillet until tender and crispy (15-18 min).",
    "Scramble or fry the eggs to your liking.",
    "Serve the eggs over the roasted potato and vegetable hash."
  ],
  144: [
    "Dice the potato, bell pepper, and onion.",
    "Brown the ground turkey in a skillet with the diced potatoes, peppers, and onion.",
    "Cover and cook over medium heat for 15-20 min, stirring occasionally, until potatoes are tender.",
    "Season to taste and serve hot."
  ],
  145: [
    "Scramble the eggs in a skillet; rinse and drain black beans.",
    "Warm the tortilla slightly.",
    "Place scrambled eggs, black beans, and cheese in the center of the tortilla.",
    "Fold in the sides, roll tightly, and serve."
  ],
  146: [
    "In a bowl or blender, mash the banana and mix with oats, egg, and milk until smooth.",
    "Heat a lightly oiled skillet over medium heat.",
    "Pour batter onto the skillet to form small pancakes and cook 2-3 min per side until golden.",
    "Serve warm."
  ],
  147: [
    "In a small pot, combine oats and milk; bring to a gentle simmer for 5-7 min until thickened.",
    "Slice the banana.",
    "Pour oatmeal into a bowl.",
    "Top with fresh blueberries and banana slices before serving."
  ],
  148: [
    "Dice or chop the apple.",
    "Combine oats and milk in a saucepan and cook over medium heat for 5-7 min.",
    "Stir in the chopped apple and a dash of cinnamon during the last 2 minutes of cooking.",
    "Transfer to a bowl and serve warm."
  ],
  149: [
    "Peel the banana and wash the strawberries.",
    "Add strawberries, banana, and milk into a blender.",
    "Blend on high speed until completely smooth.",
    "Pour into a glass and serve immediately."
  ],
  150: [
    "Add blueberries, banana, and yogurt to a blender.",
    "Blend on high until smooth and creamy.",
    "If too thick, add a small splash of water or milk to reach desired consistency.",
    "Pour into a glass and enjoy."
  ],
  151: [
    "Cook the lentils according to package instructions until tender; drain.",
    "Season and pan-sear the chicken until fully cooked; slice.",
    "Wilt the spinach and dice the tomato.",
    "Serve sliced chicken over cooked lentils, spinach, and tomato."
  ],
  152: [
    "Cook the rice and lentils according to their respective package directions.",
    "Grate or dice the carrot; chop the spinach.",
    "Sauté carrots and spinach briefly until tender.",
    "Combine lentils and rice in a bowl and top with the sautéed vegetables."
  ],
  153: [
    "Cook the rice according to package directions.",
    "Rinse and drain the chickpeas.",
    "Dice the tomato and cucumber.",
    "Serve chickpeas, tomato, and cucumber over a bed of warm rice."
  ],
  154: [
    "Boil the pasta according to package directions; drain and let cool.",
    "Rinse and drain the chickpeas.",
    "Dice the tomato and cucumber.",
    "Toss cold pasta, chickpeas, tomato, and cucumber together in a bowl."
  ],
  155: [
    "Rinse and drain the black beans; warm slightly if desired.",
    "Slice the avocado, chop the lettuce, and dice the tomato.",
    "Layer black beans as the base in a bowl.",
    "Top with fresh avocado, tomato, and lettuce."
  ],
  156: [
    "Cook the rice according to package directions.",
    "Cube the tofu and pan-fry in a lightly oiled skillet until golden and crispy.",
    "Steam or sauté broccoli florets and sliced carrots.",
    "Serve crispy tofu and vegetables over warm rice."
  ],
  157: [
    "Boil the pasta according to package directions; drain.",
    "Cube tofu and sauté until golden on all sides.",
    "Slice bell pepper and broccoli; sauté with the tofu until tender-crisp.",
    "Toss the tofu and vegetables with the cooked noodles."
  ],
  158: [
    "Cook the rice according to package directions.",
    "Cube tofu and pan-fry until golden-crisp; steam the broccoli.",
    "Whisk peanut butter with a splash of warm water to create a smooth sauce.",
    "Serve tofu and broccoli over rice, drizzled with the peanut sauce."
  ],
  159: [
    "Dice the bell pepper and tomato.",
    "In a pot, combine black beans, chopped tomato, corn, and bell pepper.",
    "Simmer over medium-low heat for 20-25 minutes, stirring occasionally.",
    "Ladle into bowls and serve warm."
  ],
  160: [
    "Brown the ground turkey in a pot until cooked through.",
    "Dice the tomato and bell pepper.",
    "Add black beans, tomato, and bell pepper to the pot with the turkey.",
    "Simmer together for 20-25 min until flavors melt together, then serve."
  ],
  161: [
    "Dice the chicken, carrot, celery, and potato.",
    "In a pot, combine chicken, vegetables, and water or broth; bring to a boil.",
    "Reduce heat and simmer for 25-30 min until potatoes and carrots are tender and chicken is cooked.",
    "Season to taste and serve warm."
  ],
  162: [
    "Dice the carrot, celery, and potato.",
    "Brown the ground turkey in a soup pot.",
    "Add vegetables and broth/water to the pot; bring to a simmer.",
    "Cook for 20-25 min until all vegetables are tender, then serve."
  ],
  163: [
    "Cube the beef, potato, carrot, and celery.",
    "Sear the beef cubes in a pot until browned on all sides.",
    "Add water/broth and diced potatoes, carrots, and celery.",
    "Simmer covered for 30-35 min until beef and potatoes are fully tender."
  ],
  164: [
    "Dice the chicken, potato, carrot, and onion.",
    "In a pot, sauté onion and chicken briefly, then add potato, carrot, and broth/water.",
    "Bring to a boil, then cover and simmer for 20-25 min until potatoes are soft.",
    "Season to taste and serve hot."
  ],
  165: [
    "Dice the carrot and onion.",
    "In a pot, combine lentils, chopped tomato, carrot, onion, and water or broth.",
    "Bring to a boil, reduce heat, and simmer for 25-30 min until lentils are soft.",
    "Ladle into bowls and serve."
  ],
  166: [
    "Dice the chicken, carrot, and onion.",
    "Add chicken, corn, carrot, onion, and broth to a pot.",
    "Simmer over medium heat for 20-25 min until chicken is fully cooked and carrots are soft.",
    "Season to taste and serve."
  ],
  167: [
    "Brown the ground turkey in a pot over medium heat.",
    "Dice the carrot and onion; add them to the pot along with chopped tomatoes and broth.",
    "Simmer for 20-25 min until carrots are soft.",
    "Serve hot in soup bowls."
  ],
  168: [
    "Dice the carrot and chop the spinach; rinse white beans.",
    "In a pot, combine white beans, tomato, carrot, and broth; simmer for 20 min.",
    "Stir in the spinach during the last 3 minutes of cooking until wilted.",
    "Serve warm."
  ],
  169: [
    "Dice the onion and chop the spinach; rinse chickpeas.",
    "In a pot, sauté onion briefly, then add chickpeas, tomato, and broth.",
    "Simmer for 15-20 min, then stir in spinach until wilted.",
    "Season to taste and serve."
  ],
  170: [
    "Dice the potato, carrot, and celery; chop the spinach.",
    "Combine potato, carrot, celery, and broth in a pot and simmer for 20 min until tender.",
    "Stir in spinach during the final 2-3 minutes of cooking.",
    "Ladle into bowls and serve."
  ],
  171: [
    "Season the chicken and grill or pan-sear until cooked through (165°F / 74°C); slice.",
    "Chop the lettuce and place it into a large salad bowl.",
    "Top lettuce with sliced chicken and parmesan cheese.",
    "Toss with your favorite Caesar dressing if desired and serve."
  ],
  172: [
    "Slice or chop the cooked turkey.",
    "Chop the lettuce, dice the tomato, and slice the avocado.",
    "Arrange lettuce in a bowl and top with turkey, tomato, and avocado.",
    "Serve fresh."
  ],
  173: [
    "Drain the tuna into a bowl.",
    "Chop the lettuce, slice the cucumber, and dice the avocado.",
    "Combine lettuce, cucumber, and avocado in a salad bowl.",
    "Top with flaked tuna and serve."
  ],
  174: [
    "Season and pan-sear the chicken; slice into bite-sized pieces.",
    "Core and thin-slice the apple.",
    "Arrange fresh spinach in a bowl, then top with chicken, apple slices, and walnuts.",
    "Toss and serve."
  ],
  175: [
    "Slice cooked turkey into bite-sized pieces.",
    "Thinly slice the apple.",
    "Place spinach in a bowl and top with turkey, apple slices, and walnuts.",
    "Serve immediately."
  ],
  176: [
    "Cook and slice the chicken breast.",
    "Chop the lettuce, dice the tomato and cucumber, and portion the feta.",
    "Combine lettuce, tomato, cucumber, and feta in a bowl.",
    "Top with sliced chicken and serve."
  ],
  177: [
    "Drain the tuna and rinse the chickpeas.",
    "Dice the cucumber and tomato; prepare fresh spinach.",
    "Combine chickpeas, cucumber, tomato, and spinach in a bowl.",
    "Top with tuna, toss gently, and serve."
  ],
  178: [
    "Hard-boil the eggs in boiling water for 9-10 min; cool, peel, and slice.",
    "Dice the tomato and avocado.",
    "Place fresh spinach in a bowl and top with sliced eggs, tomato, and avocado.",
    "Serve fresh."
  ],
  179: [
    "Rinse and drain the chickpeas.",
    "Dice the avocado, tomato, and cucumber.",
    "Combine chickpeas, avocado, tomato, and cucumber in a bowl.",
    "Toss gently and serve."
  ],
  180: [
    "Rinse and drain the black beans.",
    "Dice the avocado and tomato; chop the lettuce.",
    "Combine black beans, avocado, tomato, corn, and lettuce in a bowl.",
    "Toss well and serve."
  ],
  181: [
    "Toast the bread slices until golden and crisp.",
    "Spread peanut butter evenly over each slice.",
    "Core and thinly slice the apple.",
    "Arrange apple slices on top of the peanut butter and serve."
  ],
  182: [
    "Toast the bread to desired crispness.",
    "Spread peanut butter over the warm toast.",
    "Slice fresh strawberries.",
    "Top the peanut butter toast with sliced strawberries."
  ],
  183: [
    "Spoon Greek yogurt into a bowl.",
    "Slice the banana.",
    "Top yogurt with sliced banana and dry oats.",
    "Drizzle honey over the top before serving."
  ],
  184: [
    "Spoon Greek yogurt into a bowl.",
    "Dice or slice the apple.",
    "Top yogurt with apple slices and oats.",
    "Dust with a pinch of cinnamon and serve."
  ],
  185: [
    "Add cottage cheese to a serving bowl.",
    "Slice the banana and strawberries.",
    "Top cottage cheese with banana and berry slices.",
    "Serve immediately."
  ],
  186: [
    "Add cottage cheese to a bowl.",
    "Dice the apple and roughly chop almonds.",
    "Top cottage cheese with apple pieces and chopped almonds.",
    "Serve fresh."
  ],
  187: [
    "Add yogurt, strawberries, blueberries, and milk to a blender.",
    "Blend on high until smooth and creamy.",
    "Pour into a glass.",
    "Serve cold."
  ],
  188: [
    "Peel and dice the mango; peel the banana.",
    "Combine mango, banana, and milk in a blender.",
    "Blend until completely smooth.",
    "Pour into a glass and enjoy."
  ],
  189: [
    "Peel the banana and place in a blender.",
    "Add peanut butter and milk.",
    "Blend until thick and smooth.",
    "Pour into a glass and serve."
  ],
  190: [
    "Combine strawberries, banana, oats, and milk in a blender.",
    "Blend on high for 45-60 seconds until oats are fully processed and smooth.",
    "Pour into a glass.",
    "Serve immediately."
  ],
  191: [
    "Dice the chicken, potato, bell pepper, and onion.",
    "Heat oil in a skillet over medium heat; add chicken and cook until browned.",
    "Add potatoes, bell pepper, and onion to the skillet; cover and cook 15-20 min until potatoes are soft.",
    "Season and serve straight from the skillet."
  ],
  192: [
    "Dice the potato, bell pepper, and onion.",
    "Brown the ground beef in a skillet over medium heat; drain excess fat.",
    "Add potatoes, bell pepper, and onion to the beef.",
    "Cover and cook for 15-20 min, stirring occasionally, until potatoes are tender."
  ],
  193: [
    "Dice the potato, bell pepper, and onion.",
    "Brown the ground turkey in a skillet.",
    "Add diced potatoes, bell pepper, and onion to the skillet.",
    "Cover and cook over medium heat for 15-20 min until potatoes are tender."
  ],
  194: [
    "Dice the potato and toss with oil; roast at 400°F (200°C) for 20-25 min.",
    "Bake or pan-sear the salmon until cooked through.",
    "Sauté or wilt the fresh spinach.",
    "Assemble salmon, roasted potatoes, and spinach in a bowl."
  ],
  195: [
    "Dice the sweet potato into small cubes; roast at 400°F (200°C) for 20 min until tender.",
    "Season and pan-sear the chicken breast until cooked through (165°F / 74°C); slice.",
    "Wilt the spinach in a warm pan.",
    "Serve sliced chicken over roasted sweet potato and spinach."
  ]
  };

  export const additionalMealRecipes: Record<number, string[]> = {
  196: [
    "Dice the sweet potato into small cubes and roast at 400°F (200°C) or pan-fry for 18-20 min until tender.",
    "Brown the ground turkey in a skillet over medium heat with seasoning until fully cooked (6-8 min).",
    "Steam or sauté the broccoli for 4-5 min until tender-crisp.",
    "Assemble the ground turkey, roasted sweet potatoes, and broccoli in a serving bowl."
  ],
  197: [
    "Dice the sweet potato and roast or pan-sear until tender (18-20 min).",
    "In a skillet over medium-high heat, cook and season the beef until browned through.",
    "Steam or sauté broccoli florets until tender-crisp.",
    "Combine the seasoned beef, sweet potatoes, and broccoli into a bowl and serve."
  ],
  198: [
    "Dice the potato into small cubes and roast at 400°F (200°C) for 20 min until golden and tender.",
    "Season the chicken and pan-sear for 5-6 min per side until internal temperature reaches 165°F (74°C); slice.",
    "Steam the broccoli florets for 4-5 min until tender-crisp.",
    "Serve the sliced chicken alongside the roasted potatoes and steamed broccoli."
  ],
  199: [
    "Cook the rice according to package directions.",
    "Brown the ground turkey in a skillet over medium heat until fully cooked.",
    "Steam or sauté the broccoli until tender-crisp.",
    "Serve the ground turkey and broccoli over a bed of warm rice."
  ],
  200: [
    "Cook the rice according to package directions.",
    "Dice and cook the chicken in a skillet until golden and cooked through.",
    "Dice the fresh tomato and warm the sweet corn.",
    "Top the rice with cooked chicken, sweet corn, and diced tomatoes."
  ],
  201: [
    "Cook the rice according to package directions.",
    "Brown and season the beef in a skillet over medium heat.",
    "Dice the tomato and warm the sweet corn.",
    "Layer the warm rice with seasoned beef, sweet corn, and fresh tomato."
  ],
  202: [
    "Season chicken breast with salt, pepper, garlic, lemon juice, and olive oil.",
    "Cook in a skillet over medium heat for 6–8 minutes per side, until fully cooked.",
    "Serve with roasted vegetables and rice."
  ],

  // 203 — Chicken Fajita Bowl
  203: [
    "Slice chicken, bell peppers, and onion; season with cumin, paprika, and garlic.",
    "Cook chicken in a skillet until fully cooked, then add peppers and onion and sauté until tender.",
    "Serve over rice with black beans, salsa, and avocado."
  ],

  // 204 — Honey Garlic Chicken
  204: [
    "Cut chicken into bite-sized pieces and season lightly with pepper.",
    "Cook in a skillet until fully cooked; add honey, minced garlic, and low-sodium soy sauce.",
    "Simmer until the sauce thickens and serve with rice and broccoli."
  ],

  // 205 — Chicken Pesto Pasta
  205: [
    "Boil pasta according to package directions and reserve a little pasta water.",
    "Cook diced chicken in a skillet until fully cooked, then stir in pesto.",
    "Toss with pasta, a splash of pasta water, and halved cherry tomatoes."
  ],

  // 206 — Chicken Fried Rice
  206: [
    "Cook diced chicken in a lightly oiled skillet until fully cooked.",
    "Add mixed vegetables, cooked rice, and a beaten egg; stir-fry until heated through.",
    "Season with low-sodium soy sauce and sliced green onions."
  ],

  // 207 — Chicken Parmesan
  207: [
    "Coat chicken cutlets in egg and seasoned breadcrumbs.",
    "Bake at 400°F until cooked through, adding marinara and mozzarella near the end.",
    "Serve with whole-wheat pasta or a side salad."
  ],

  // 208 — Chicken Lettuce Wraps
  208: [
    "Cook finely diced chicken with garlic and ginger until fully cooked.",
    "Stir in diced carrots, water chestnuts, and a little low-sodium soy sauce.",
    "Spoon the mixture into washed lettuce leaves and garnish with green onions."
  ],

  // 209 — Chicken and Sweet Potato Tray Bake
  209: [
    "Cut sweet potatoes into cubes and toss with olive oil, paprika, and pepper.",
    "Arrange with seasoned chicken on a baking tray and roast at 400°F until everything is cooked through and tender.",
    "Serve with steamed green beans."
  ],

  // 210 — Chicken Tikka Rice Bowl
  210: [
    "Marinate diced chicken in plain yogurt, curry spices, garlic, and lemon juice.",
    "Cook in a skillet until fully cooked; add tomato sauce and simmer briefly.",
    "Serve over rice with cucumber and a spoonful of yogurt."
  ],

  // 211 — Turkey Taco Bowl
  211: [
    "Cook ground turkey in a skillet, breaking it apart as it browns.",
    "Add taco seasoning, a splash of water, and black beans; simmer until hot.",
    "Serve over rice with lettuce, salsa, corn, and avocado."
  ],

  // 212 — Turkey Stuffed Peppers
  212: [
    "Halve bell peppers and place them in a baking dish.",
    "Cook ground turkey with onion, cooked rice, diced tomatoes, and seasoning; fill the peppers.",
    "Cover and bake at 375°F until the peppers are tender and the filling reaches a safe temperature."
  ],

  // 213 — Turkey Meatballs with Rice
  213: [
    "Mix ground turkey with breadcrumbs, egg, garlic, and Italian seasoning; shape into meatballs.",
    "Bake at 400°F until fully cooked, or simmer them in tomato sauce until done.",
    "Serve with rice and steamed vegetables."
  ],

  // 214 — Turkey and Avocado Wrap
  214: [
    "Spread hummus or Greek yogurt on a whole-wheat tortilla.",
    "Layer sliced cooked turkey, avocado, lettuce, tomato, and shredded carrots.",
    "Roll tightly, slice in half, and serve with fruit."
  ],

  // 215 — Turkey Chili
  215: [
    "Cook ground turkey with diced onion and garlic in a large pot.",
    "Add beans, diced tomatoes, chili powder, cumin, and a little broth; simmer for 20–30 minutes.",
    "Serve with a spoonful of Greek yogurt and whole-grain bread."
  ],

  // 216 — Turkey Burger
  216: [
    "Season ground turkey with garlic, pepper, and paprika; shape into patties.",
    "Cook in a skillet or grill until the center reaches 165°F.",
    "Serve on a whole-grain bun with lettuce, tomato, and baked potato wedges."
  ],

  // 217 — Turkey Sausage Breakfast Bowl
  217: [
    "Cook turkey sausage thoroughly in a skillet and set aside.",
    "Scramble eggs with spinach and serve alongside roasted breakfast potatoes.",
    "Combine in a bowl and season with pepper and herbs."
  ],

  // 218 — Turkey Bolognese
  218: [
    "Cook ground turkey with diced onion, carrot, and garlic.",
    "Add crushed tomatoes, Italian herbs, and a splash of broth; simmer for 15–20 minutes.",
    "Serve over cooked whole-wheat spaghetti."
  ],

  // 219 — Turkey and Hummus Pita
  219: [
    "Warm a whole-wheat pita and spread hummus inside.",
    "Add cooked sliced turkey, cucumber, tomato, and shredded lettuce.",
    "Season with lemon juice and serve with fresh fruit."
  ],

  // 220 — Turkey Stuffed Zucchini
  220: [
    "Halve zucchini lengthwise and scoop out the centers.",
    "Cook ground turkey with the chopped zucchini centers, tomato sauce, and herbs; fill the zucchini halves.",
    "Bake at 375°F until the zucchini is tender and the filling is fully cooked."
  ],

  // 221 — Baked Salmon and Rice
  221: [
    "Place salmon on a lined baking tray and season with lemon, garlic, pepper, and olive oil.",
    "Bake at 400°F for about 12–15 minutes, depending on thickness, until it reaches 145°F.",
    "Serve with rice and steamed broccoli."
  ],

  // 222 — Teriyaki Salmon
  222: [
    "Season salmon lightly and bake at 400°F until nearly cooked through.",
    "Brush with teriyaki sauce and return to the oven until the salmon reaches 145°F.",
    "Serve over rice with steamed edamame and carrots."
  ],

  // 223 — Salmon Avocado Bowl
  223: [
    "Bake or pan-cook salmon with lemon, pepper, and garlic until it reaches 145°F.",
    "Prepare rice and slice avocado, cucumber, and carrots.",
    "Arrange everything in a bowl and drizzle with a little soy sauce and lemon."
  ],

  // 224 — Tuna Salad Sandwich
  224: [
    "Drain canned tuna and mix with Greek yogurt, mustard, diced celery, and pepper.",
    "Layer the tuna mixture on whole-grain bread with lettuce and tomato.",
    "Serve with carrot sticks and fruit."
  ],

  // 225 — Tuna Pasta Salad
  225: [
    "Cook pasta, drain, and allow it to cool slightly.",
    "Mix with drained tuna, cucumber, cherry tomatoes, peas, and a lemon-yogurt dressing.",
    "Chill briefly and toss before serving."
  ],

  // 226 — Garlic Shrimp Rice Bowl
  226: [
    "Season peeled shrimp with garlic, paprika, lemon, and pepper.",
    "Sauté until opaque and cooked through, about 2–3 minutes per side depending on size.",
    "Serve over rice with sautéed zucchini and bell peppers."
  ],

  // 227 — Shrimp Tacos
  227: [
    "Season shrimp with cumin, paprika, garlic, and lime juice.",
    "Sauté until opaque and cooked through.",
    "Fill warm tortillas with shrimp, shredded cabbage, avocado, and yogurt-lime sauce."
  ],

  // 228 — Shrimp Garlic Pasta
  228: [
    "Boil pasta according to package directions and reserve a little cooking water.",
    "Sauté garlic in olive oil, add shrimp, and cook until opaque; stir in lemon juice.",
    "Toss with pasta, spinach, and a splash of pasta water."
  ],

  // 229 — Baked Cod with Potatoes
  229: [
    "Cut potatoes into wedges, season with olive oil and herbs, and roast at 400°F until tender.",
    "Season cod with lemon, garlic, and pepper; bake until it reaches 145°F.",
    "Serve the fish with potatoes and green beans."
  ],

  // 230 — Fish Taco Bowl
  230: [
    "Season white fish with paprika, cumin, lime, and pepper.",
    "Bake at 400°F until it flakes easily and reaches 145°F.",
    "Serve over rice with cabbage, corn, salsa, and avocado."
  ],

  // 231 — Chickpea Coconut Curry
  231: [
    "Sauté diced onion, garlic, and ginger until fragrant.",
    "Add chickpeas, curry powder, diced tomatoes, and light coconut milk; simmer for 15 minutes.",
    "Stir in spinach and serve over rice."
  ],

  // 232 — Chickpea Greek Salad
  232: [
    "Rinse and drain canned chickpeas.",
    "Combine with cucumber, tomatoes, red onion, olives, and crumbled feta.",
    "Dress with lemon juice, olive oil, oregano, and black pepper."
  ],

  // 233 — Crispy Chickpea Wrap
  233: [
    "Season drained chickpeas with paprika, cumin, and olive oil; roast at 400°F until lightly crisp.",
    "Spread hummus on a whole-wheat wrap and add lettuce, cucumber, and tomatoes.",
    "Add the chickpeas, roll tightly, and serve."
  ],

  // 234 — Lentil Tomato Soup
  234: [
    "Sauté onion, carrot, and garlic in a pot until softened.",
    "Add rinsed lentils, diced tomatoes, broth, and Italian herbs; simmer until the lentils are tender.",
    "Season to taste and serve with whole-grain bread."
  ],

  // 235 — Lentil Curry Bowl
  235: [
    "Sauté onion, garlic, and ginger with curry powder.",
    "Add rinsed lentils, diced tomatoes, and broth; simmer until the lentils are tender.",
    "Serve over rice with a spoonful of plain yogurt."
  ],

  // 236 — Black Bean Quesadillas
  236: [
    "Mash black beans lightly with cumin, garlic, and a spoonful of salsa.",
    "Spread on a whole-wheat tortilla, add shredded cheese, fold, and cook in a skillet until crisp.",
    "Slice and serve with salsa, avocado, and a side salad."
  ],

  // 237 — Black Bean Sweet Potato Bowl
  237: [
    "Cube sweet potatoes, season with paprika and olive oil, and roast at 400°F until tender.",
    "Warm black beans with cumin and a little salsa.",
    "Serve together over rice with avocado and lime."
  ],

  // 238 — Three-Bean Chili
  238: [
    "Sauté diced onion, bell pepper, and garlic in a large pot.",
    "Add kidney beans, black beans, pinto beans, tomatoes, broth, and chili spices; simmer for 25 minutes.",
    "Serve with whole-grain toast or brown rice."
  ],

  // 239 — Tofu Stir-Fry
  239: [
    "Press tofu dry, cube it, and pan-sear until golden on several sides.",
    "Add broccoli, bell pepper, carrots, and a little garlic-ginger sauce; cook until vegetables are tender-crisp.",
    "Serve over rice or noodles."
  ],

  // 240 — Peanut Tofu Noodles
  240: [
    "Cook noodles according to package directions and drain.",
    "Pan-sear cubed tofu; mix peanut butter, lime juice, soy sauce, and warm water into a smooth sauce.",
    "Toss noodles and tofu with the sauce and shredded carrots."
  ],

  // 241 — Tofu Scramble
  241: [
    "Crumble firm tofu into a lightly oiled skillet.",
    "Add turmeric, pepper, garlic powder, spinach, and diced bell pepper; cook until heated through.",
    "Serve with whole-grain toast and sliced avocado."
  ],

  // 242 — Vegetable Fried Rice
  242: [
    "Heat a little oil in a skillet and sauté carrots, peas, and diced onion.",
    "Add cooked rice and a beaten egg; stir-fry until the egg is cooked.",
    "Season with low-sodium soy sauce and green onions."
  ],

  // 243 — Egg and Spinach Breakfast Wrap
  243: [
    "Scramble eggs with spinach and diced tomatoes in a skillet.",
    "Warm a whole-wheat tortilla and add the egg mixture and a little shredded cheese.",
    "Roll tightly and serve with fruit."
  ],

  // 244 — Veggie Omelet
  244: [
    "Whisk eggs with a splash of milk and black pepper.",
    "Cook in a nonstick skillet; add spinach, mushrooms, tomatoes, and cheese.",
    "Fold the omelet when the eggs are set and serve with whole-grain toast."
  ],

  // 245 — Shakshuka
  245: [
    "Sauté onion and bell pepper with garlic, paprika, and cumin.",
    "Add crushed tomatoes and simmer until thickened; make small wells and crack eggs into them.",
    "Cover and cook until the egg whites are set; serve with whole-grain bread."
  ],

  // 246 — Breakfast Sweet Potato Hash
  246: [
    "Dice sweet potato and cook in a covered skillet with a little oil and water until almost tender.",
    "Add diced bell pepper, onion, and seasoning; cook until softened.",
    "Top with a cooked egg or serve with black beans."
  ],

  // 247 — Banana Oat Pancakes
  247: [
    "Blend ripe banana, oats, eggs, milk, and cinnamon into a batter.",
    "Cook small pancakes in a lightly oiled skillet over medium-low heat until bubbles form, then flip.",
    "Serve with berries and plain yogurt."
  ],

  // 248 — Apple Cinnamon Overnight Oats
  248: [
    "Combine rolled oats, milk, plain yogurt, cinnamon, and diced apple in a container.",
    "Stir well, cover, and refrigerate overnight.",
    "Top with chopped nuts or seeds before eating."
  ],

  // 249 — Berry Yogurt Parfait
  249: [
    "Spoon plain Greek yogurt into a glass or bowl.",
    "Layer with berries, rolled oats or granola, and a little cinnamon.",
    "Finish with nuts or seeds and serve chilled."
  ],

  // 250 — Peanut Butter Banana Oatmeal
  250: [
    "Simmer rolled oats in milk or water until creamy.",
    "Stir in sliced banana, peanut butter, and cinnamon.",
    "Top with seeds or chopped nuts and serve warm."
  ],

  // 251 — Mango Yogurt Smoothie Bowl
  251: [
    "Blend frozen mango, plain yogurt, and milk until thick and smooth.",
    "Pour into a bowl.",
    "Top with sliced banana, oats, and chia seeds."
  ],

  // 252 — Strawberry Banana Smoothie
  252: [
    "Add strawberries, banana, milk, and plain yogurt to a blender.",
    "Blend until smooth, adding more milk if needed.",
    "Pour into a glass and serve immediately."
  ],

  // 253 — Blueberry Spinach Smoothie
  253: [
    "Add blueberries, a handful of spinach, banana, yogurt, and milk to a blender.",
    "Blend until smooth.",
    "Adjust the thickness with milk or water and serve chilled."
  ],

  // 254 — Apple Walnut Salad
  254: [
    "Wash and slice an apple; chop lettuce, cucumber, and celery.",
    "Toss with walnuts and a little crumbled cheese if desired.",
    "Dress with olive oil, lemon juice, and black pepper."
  ],

  // 255 — Mediterranean Quinoa Bowl
  255: [
    "Rinse quinoa and cook according to package directions.",
    "Combine with chickpeas, cucumber, tomatoes, olives, and feta.",
    "Dress with lemon juice, olive oil, and oregano."
  ],

  // 256 — Quinoa Black Bean Salad
  256: [
    "Cook quinoa and let it cool slightly.",
    "Mix with black beans, corn, diced bell pepper, and chopped cilantro.",
    "Dress with lime juice, olive oil, cumin, and pepper."
  ],

  // 257 — Mushroom Spinach Risotto
  257: [
    "Sauté sliced mushrooms and onion in olive oil until softened.",
    "Add arborio rice and gradually stir in warm broth until the rice is creamy and tender.",
    "Fold in spinach and a little Parmesan before serving."
  ],

  // 258 — Tomato Basil Pasta
  258: [
    "Cook pasta according to package directions.",
    "Sauté garlic and cherry tomatoes in olive oil until the tomatoes soften.",
    "Toss with pasta, fresh basil, black pepper, and a little Parmesan."
  ],

  // 259 — Roasted Vegetable Pasta
  259: [
    "Toss zucchini, bell pepper, onion, and cherry tomatoes with olive oil and Italian seasoning.",
    "Roast at 400°F until tender while cooking whole-wheat pasta.",
    "Combine the vegetables and pasta with a little pasta water and Parmesan."
  ],

  // 260 — Spinach Ricotta Stuffed Shells
  260: [
    "Cook jumbo pasta shells until just tender and drain.",
    "Mix ricotta, chopped spinach, egg, and Italian seasoning; fill the shells and place in a baking dish with marinara.",
    "Top with mozzarella and bake at 375°F until hot and bubbling."
  ],

  // 261 — Vegetable Lasagna
  261: [
    "Sauté mushrooms, zucchini, spinach, and onion until softened.",
    "Layer lasagna noodles with marinara, the vegetables, ricotta, and mozzarella in a baking dish.",
    "Cover and bake at 375°F until tender; uncover near the end to brown the cheese."
  ],

  // 262 — Creamy Pumpkin Pasta
  262: [
    "Cook whole-wheat pasta and reserve some pasta water.",
    "Warm pumpkin purée with garlic, milk, Italian seasoning, and Parmesan until smooth.",
    "Toss with pasta, adding pasta water until the sauce coats it well."
  ],

  // 263 — Broccoli Cheddar Baked Potato
  263: [
    "Bake a scrubbed potato at 400°F until soft in the center.",
    "Steam broccoli until tender and warm it with a little shredded cheddar.",
    "Split the potato and fill with broccoli, cheese, and plain Greek yogurt."
  ],

  // 264 — Cauliflower Chickpea Tray Bake
  264: [
    "Cut cauliflower into florets and rinse and drain chickpeas.",
    "Toss with olive oil, cumin, paprika, and garlic; roast at 400°F until golden and tender.",
    "Serve with couscous or rice and a lemon-yogurt sauce."
  ],

  // 265 — Eggplant Tomato Stew
  265: [
    "Cube eggplant and sauté with onion and garlic until beginning to soften.",
    "Add diced tomatoes, chickpeas, and herbs; cover and simmer until the eggplant is tender.",
    "Serve over couscous or whole-grain bread."
  ],

  // 266 — Vegetable Coconut Curry
  266: [
    "Sauté onion, garlic, and curry powder in a pot.",
    "Add mixed vegetables, chickpeas, light coconut milk, and a little broth; simmer until tender.",
    "Serve over rice and garnish with cilantro."
  ],

  // 267 — Paneer Tikka Rice Bowl
  267: [
    "Cube paneer and coat with yogurt, paprika, cumin, turmeric, and lemon juice.",
    "Bake at 400°F or pan-sear until lightly golden and hot throughout.",
    "Serve over rice with cucumber, tomatoes, and mint yogurt sauce."
  ],

  // 268 — Vegetable Soba Noodles
  268: [
    "Cook soba noodles according to package directions and rinse briefly.",
    "Stir-fry broccoli, carrots, mushrooms, and bell pepper until tender-crisp.",
    "Toss with noodles, ginger, and a low-sodium soy-lime dressing."
  ],

  // 269 — Sesame Edamame Rice Bowl
  269: [
    "Cook rice and prepare shelled edamame according to package directions.",
    "Sauté carrots and broccoli with garlic and a splash of low-sodium soy sauce.",
    "Serve over rice with edamame, sesame seeds, and lime."
  ],

  // 270 — Peanut Butter Tofu Bowl
  270: [
    "Cube and pan-sear pressed tofu until golden.",
    "Whisk peanut butter with lime juice, soy sauce, grated ginger, and warm water.",
    "Serve tofu over rice with cucumber and carrots, drizzled with peanut sauce."
  ],

  // 271 — Chicken Orzo Soup
  271: [
    "Sauté diced onion, carrot, and celery in a pot.",
    "Add broth, cooked chicken, and orzo; simmer until the orzo is tender.",
    "Stir in spinach and lemon juice, then season and serve."
  ],

  // 272 — Chicken and Vegetable Soup
  272: [
    "Sauté onion, carrots, and celery until softened.",
    "Add cooked chicken, broth, peas, and herbs; simmer until the vegetables are tender.",
    "Season with pepper and serve with whole-grain bread."
  ],

  // 273 — Chicken Couscous Bowl
  273: [
    "Season chicken with paprika, garlic, lemon, and pepper; cook until fully cooked.",
    "Prepare couscous according to package directions and fluff with a fork.",
    "Serve chicken over couscous with roasted zucchini and chickpeas."
  ],

  // 274 — Chicken and Black Bean Enchiladas
  274: [
    "Mix shredded cooked chicken with black beans, corn, and a little enchilada sauce.",
    "Fill tortillas, roll them into a baking dish, and cover with sauce and shredded cheese.",
    "Bake at 375°F until hot and bubbling."
  ],

  // 275 — Chicken Greek Pita
  275: [
    "Season chicken with oregano, garlic, lemon juice, and pepper; cook until fully cooked.",
    "Fill a whole-wheat pita with chicken, cucumber, tomatoes, lettuce, and feta.",
    "Add a yogurt-cucumber sauce and serve."
  ],

  // 276 — Chicken and Broccoli Noodles
  276: [
    "Cook noodles according to package directions.",
    "Stir-fry sliced chicken until fully cooked, then add broccoli and garlic.",
    "Toss with noodles and a light low-sodium soy sauce."
  ],

  // 277 — Chicken Burrito Wrap
  277: [
    "Cook diced chicken with cumin, paprika, and garlic until fully cooked.",
    "Layer chicken, rice, black beans, corn, salsa, and lettuce in a whole-wheat tortilla.",
    "Fold in the sides, roll tightly, and serve."
  ],

  // 278 — Chicken Shawarma Bowl
  278: [
    "Coat chicken strips with cumin, paprika, turmeric, garlic, lemon, and olive oil.",
    "Bake or pan-cook until fully cooked and lightly browned.",
    "Serve with rice, cucumber-tomato salad, and yogurt sauce."
  ],

  // 279 — Turkey Shepherd's Pie
  279: [
    "Cook ground turkey with onion, carrots, peas, and broth until the vegetables soften.",
    "Transfer to a baking dish and spread mashed potatoes evenly over the top.",
    "Bake at 375°F until the filling is bubbling and the topping is lightly golden."
  ],

  // 280 — Turkey and Rice Stuffed Cabbage
  280: [
    "Soften cabbage leaves in boiling water and prepare cooked rice.",
    "Mix cooked rice with ground turkey, onion, and tomato sauce; fill and roll the cabbage leaves.",
    "Place in a baking dish with extra tomato sauce and bake covered at 375°F until fully cooked."
  ],

  // 281 — Salmon Cakes
  281: [
    "Mix cooked flaked salmon with egg, breadcrumbs, chopped green onion, and lemon juice.",
    "Shape into patties and pan-cook with a little oil until golden and hot throughout.",
    "Serve with roasted potatoes and a cucumber salad."
  ],

  // 282 — Mediterranean Tuna Bowl
  282: [
    "Prepare couscous or quinoa according to package directions.",
    "Top with drained tuna, chickpeas, cucumber, tomatoes, and olives.",
    "Dress with lemon juice, olive oil, and oregano."
  ],

  // 283 — Lemon Dill White Fish
  283: [
    "Place white fish fillets in a baking dish and season with lemon, dill, garlic, and pepper.",
    "Bake at 400°F until the fish reaches 145°F and flakes easily.",
    "Serve with roasted potatoes and steamed peas."
  ],

  // 284 — Shrimp Quinoa Salad
  284: [
    "Cook quinoa and let it cool slightly.",
    "Season shrimp with garlic and paprika, then sauté until opaque and cooked through.",
    "Combine quinoa, shrimp, cucumber, tomatoes, and lemon dressing."
  ],

  // 285 — Red Lentil Dahl
  285: [
    "Sauté onion, garlic, ginger, and curry spices in a pot.",
    "Add rinsed red lentils, diced tomatoes, and broth; simmer until soft and creamy.",
    "Serve with rice and a squeeze of lemon."
  ],

  // 286 — White Bean Spinach Stew
  286: [
    "Sauté garlic and onion in olive oil until fragrant.",
    "Add drained white beans, diced tomatoes, broth, and Italian herbs; simmer for 15 minutes.",
    "Stir in spinach until wilted and serve with whole-grain toast."
  ],

  // 287 — Hummus Veggie Grain Bowl
  287: [
    "Cook quinoa or brown rice and set aside.",
    "Roast broccoli, carrots, and bell peppers with olive oil and seasoning.",
    "Serve grains and vegetables with hummus, cucumber, and lemon juice."
  ],

  // 288 — Baked Falafel Bowl
  288: [
    "Pulse chickpeas with parsley, onion, garlic, cumin, and breadcrumbs until the mixture holds together.",
    "Shape into small patties and bake at 400°F, turning once, until golden and heated through.",
    "Serve with rice, cucumber, tomatoes, and yogurt-tahini sauce."
  ],

  // 289 — Greek Yogurt Chicken Salad
  289: [
    "Dice cooked chicken and combine with plain Greek yogurt, celery, grapes, and a little mustard.",
    "Season with pepper, lemon juice, and chopped herbs.",
    "Serve in a whole-wheat wrap or over lettuce."
  ],

  // 290 — Avocado Egg Toast
  290: [
    "Toast whole-grain bread until crisp.",
    "Mash avocado with lemon juice and black pepper, then spread over the toast.",
    "Top with a cooked egg and serve with sliced tomatoes."
  ],

  // 291 — Cottage Cheese Veggie Toast
  291: [
    "Toast whole-grain bread.",
    "Spread cottage cheese over the toast and top with cucumber, tomatoes, and black pepper.",
    "Finish with herbs and serve with fruit."
  ],

  // 292 — Savory Oatmeal with Egg
  292: [
    "Cook rolled oats in water or broth until creamy.",
    "Stir in spinach and season with garlic powder and pepper.",
    "Top with a cooked egg and a sprinkle of cheese if desired."
  ],

  // 293 — Baked Apple Cinnamon Oats
  293: [
    "Mix rolled oats, milk, diced apple, egg, cinnamon, and baking powder in a bowl.",
    "Pour into a lightly greased baking dish and bake at 350°F until set.",
    "Serve warm with plain yogurt."
  ],

  // 294 — Chia Berry Pudding
  294: [
    "Mix chia seeds with milk, vanilla, and a little maple syrup if desired.",
    "Refrigerate for at least 3 hours or overnight, stirring once after the first few minutes.",
    "Top with berries and chopped nuts before serving."
  ],

  // 295 — Chocolate Banana Overnight Oats
  295: [
    "Mix rolled oats, milk, plain yogurt, mashed banana, and unsweetened cocoa powder.",
    "Cover and refrigerate overnight.",
    "Stir before serving and top with banana slices or seeds."
  ],

  // 296 — Peanut Butter Apple Toast
  296: [
    "Toast whole-grain bread.",
    "Spread peanut butter over the toast and arrange thin apple slices on top.",
    "Sprinkle with cinnamon and serve."
  ],

  // 297 — Roasted Chickpea Salad Wrap
  297: [
    "Season drained chickpeas with cumin, paprika, and olive oil; roast at 400°F until lightly crisp.",
    "Toss lettuce, cucumber, tomatoes, and shredded carrots with lemon dressing.",
    "Wrap the salad and chickpeas in a whole-wheat tortilla."
  ],

  // 298 — Sweet Potato Black Bean Tacos
  298: [
    "Roast cubed sweet potato with olive oil, cumin, and paprika at 400°F until tender.",
    "Warm black beans with garlic and a little salsa.",
    "Fill tortillas with sweet potato and beans; add cabbage, lime, and avocado."
  ],

  // 299 — Pesto White Bean Pasta
  299: [
    "Cook whole-wheat pasta according to package directions.",
    "Warm drained white beans with cherry tomatoes and a little pesto in a skillet.",
    "Toss with pasta, spinach, and a splash of pasta water."
  ],

  // 300 — Vegetable Enchilada Bake
  300: [
    "Sauté zucchini, bell pepper, corn, and black beans with cumin.",
    "Layer tortillas, vegetables, enchilada sauce, and shredded cheese in a baking dish.",
    "Bake at 375°F until bubbling and serve with lettuce and plain yogurt."
  ],

  // 301 — Lemon Herb Couscous Bowl
  301: [
    "Prepare couscous according to package directions and fluff with a fork.",
    "Toss with chickpeas, cucumber, tomatoes, parsley, lemon juice, and olive oil.",
    "Serve with feta or grilled chicken if desired."
  ], 
};

export const getRecipe = (mealId: number): string[] =>
  recipes[mealId] ?? additionalMealRecipes[mealId] ?? [];
