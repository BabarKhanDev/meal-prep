async function main() {

    await loadRecipes()

}

async function loadRecipes() {
    recipes_container = document.getElementById("recipes")

    recipes = await fetch("/all_recipes")
    recipes_json = await recipes.json()
    console.log(recipes_json)
    recipes_json.forEach(recipe => {
        recipes_container.appendChild(
            createRecipeElement(recipe)
        )
    });
}


function createRecipeElement(recipe) {
    var container = document.createElement("div")
    var meal_name = document.createElement("p")
    meal_name.innerHTML = convertSentenceToUppercase(recipe.name)
    meal_name.className = "mealname"
    container.appendChild(meal_name)

    
    var meal_plan_button = document.createElement("button")
    meal_plan_button.innerHTML = "Add To Meal Plan"
    meal_plan_button.className = "mealplanbutton button green"
    meal_plan_button.recipe = recipe.name
    meal_plan_button.addEventListener("click", addToMealPlanHandler)
    container.appendChild(meal_plan_button)

    var recipe_button = document.createElement("button")
    recipe_button.innerHTML = "View Ingredients"
    recipe_button.className = "ingredientsbutton button green"
    recipe_button.recipe = recipe.name
    recipe_button.addEventListener("click", goToRecipeHandler)
    container.appendChild(recipe_button)

    return container
}

function addToMealPlanHandler(evt) {
    alert(this.recipe)
}

function goToRecipeHandler(evt) {
    window.location.href = "/recipe/" + this.recipe;
}

function convertSentenceToUppercase(sentence) {
    var words = sentence.split(" ");

    for (let i = 0; i < words.length; i++) {
        words[i] = words[i][0].toUpperCase() + words[i].substr(1);
    }

    return words.join(" ");
}