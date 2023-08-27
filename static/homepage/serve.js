async function fillShoppingList() {
    let shoppingList = await fetch("/shopping_list");
    let shoppingListJson = await shoppingList.json();
    for (let i = 0; i < shoppingListJson.length; i++) {
        createShoppingListRecipeBox(shoppingListJson[i])
    }
}

async function fillPantry() {
    let pantry = await fetch("/pantry");
    let pantryJson = await pantry.json();
    for (let i = 0; i < pantryJson.length; i++) {
        createPantryRecipeBox(pantryJson[i])
    }
}

function createShoppingListModal(list) {
    try{document.getElementById("shopping-list-modal").remove()} catch {}
    let modal = document.createElement("div")
    modal.setAttribute("id", "shopping-list-modal")

    for (let ingredient in list) {
        for (let unit in list[ingredient]) {
            let amount = list[ingredient][unit]
            if (amount !== 0) {
                let modalIngredient = document.createElement("p")
                modalIngredient.textContent = amount + unit + " " + ingredient
                modal.appendChild(modalIngredient)
            }
        }
    }

    let button = document.createElement("button")
    button.addEventListener("click", () => {
        const encodedPlaintext = encodeURIComponent("test\nnewline");

        // Redirect to Page B with the encoded content as a parameter
        window.location.href = 'shopping_list_plain?content=' + encodedPlaintext;
    })
    modal.appendChild(button)

    document.body.appendChild(modal)

}

async function main() {
    await loadRecipeMenu()
    await fillShoppingList()
    await fillPantry()

    let searchBox = document.getElementById('recipe-search-box')
    searchBox.addEventListener('input', () => {
        const searchTerm = searchBox.value.trim().toLowerCase();

        let items = document.querySelectorAll('div.recipeListItem')
        items.forEach(item => {
            const itemName = item.getAttribute('name').toLowerCase();
            if (fuzzyMatch(itemName, searchTerm)) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });
    });

    let createShoppingListButton = document.getElementById("create-shopping-list")
    createShoppingListButton.addEventListener("click", async () => {
        let items = document.querySelectorAll("#shopping-list .meal");
        let out = Array.from(items).map(element => element.getAttribute("name"));
        let response = await fetch("/create_shopping_list", {
            method: "POST", // *GET, POST, PUT, DELETE, etc.
            cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
            headers: {
                "Content-Type": "application/json",
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(out), // body data type must match "Content-Type" header
        });
        let list = await response.json()
        createShoppingListModal(list)
    })
}

function fuzzyMatch(str, searchTerm) {
    // Implement your fuzzy matching logic here
    // You can use algorithms like Levenshtein distance, Jaro-Winkler, etc.
    // For simplicity, here's a basic example using includes()
    return str.includes(searchTerm);
}

async function loadRecipeMenu() {
    let modal = document.getElementById("recipe-menu")

    // create new meal button
    let createMealButton = document.createElement("button")
    createMealButton.addEventListener("click", function (){
        window.location.href = "/new_recipe"
    })
    createMealButton.setAttribute("id","create-meal")
    createMealButton.textContent = "Create New Meal"
    createMealButton.style.removeProperty('width');
    modal.appendChild(createMealButton)

    // get all recipes and list them
    let recipes = await fetch("/all_recipes")
    let recipesJson = await recipes.json()

    for (let i = 0; i < recipesJson.length; i++) {
        modal.appendChild(createMenuRecipeBox(recipesJson[i]))
    }

}

function createMenuRecipeBox(recipe) {
    const mealDiv = document.createElement("div");
    mealDiv.className = "meal recipeListItem";
    mealDiv.setAttribute("name", recipe.name)

    const pantryButton = document.createElement("button");
    pantryButton.className = "add-to-pantry good";
    pantryButton.innerHTML = "<img src='/static/images/pantry.svg' alt='pantry'>";
    pantryButton.setAttribute("title", "Add To Pantry")
    pantryButton.addEventListener("click", addMealToPantry)
    mealDiv.appendChild(pantryButton);

    const shoppingListButton = document.createElement("button");
    shoppingListButton.className = "add-to-list good";
    shoppingListButton.innerHTML = "<img src='/static/images/list.svg' alt='shopping list'>";
    shoppingListButton.setAttribute("title", "Add To Shopping List")
    shoppingListButton.addEventListener("click", addMealToList)
    mealDiv.appendChild(shoppingListButton);

    const paragraph = document.createElement("p");
    paragraph.textContent = recipe["name"];
    mealDiv.appendChild(paragraph);

    return mealDiv
}

function removePantryItem(evt) {
    let recipe_name = this.parentNode.getAttribute("name");
    fetch("/remove_from_pantry", {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(recipe_name), // body data type must match "Content-Type" header
    });
    this.parentNode.remove();
}

function removeShoppingListItem(evt) {
    let recipe_name = this.parentNode.getAttribute("name");
    fetch("/remove_from_shopping_list", {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(recipe_name), // body data type must match "Content-Type" header
    });
    this.parentNode.remove();
}

function createPantryRecipeBox(recipe_name) {
    const div = document.createElement('div');
    div.className = 'meal';
    div.setAttribute("name", recipe_name)

    const deleteButton = document.createElement('button');
    deleteButton.title = 'Meal Eaten';
    deleteButton.className = 'delete-meal bad';
    deleteButton.addEventListener("click", removePantryItem)

    const deleteImg = document.createElement('img');
    deleteImg.src = '/static/images/delete.svg';
    deleteImg.alt = 'delete';

    deleteButton.appendChild(deleteImg);
    div.appendChild(deleteButton);

    const p = document.createElement('p');
    p.textContent = recipe_name;
    div.appendChild(p);

    document.getElementById("pantry").appendChild(div);
}

function shoppingListToPantry(evt) {
    let meal_name = this.parentNode.getAttribute("name");
    fetch("/remove_from_shopping_list", {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(meal_name), // body data type must match "Content-Type" header
    });
    fetch("/add_to_pantry", {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify({meal_name}), // body data type must match "Content-Type" header
    })
    this.parentNode.remove();
    createPantryRecipeBox(meal_name);
}

function createShoppingListRecipeBox(recipe_name) {
    const div = document.createElement('div');
    div.className = 'meal';
    div.setAttribute("name", recipe_name)

    const deleteButton = document.createElement('button');
    deleteButton.title = 'Remove From List';
    deleteButton.className = 'delete-meal bad';
    deleteButton.addEventListener("click", removeShoppingListItem)

    const deleteImg = document.createElement('img');
    deleteImg.src = '/static/images/delete.svg';
    deleteImg.alt = 'delete';

    deleteButton.appendChild(deleteImg);
    div.appendChild(deleteButton);

    const addToPantryButton = document.createElement('button');
    addToPantryButton.title = 'Add To Pantry';
    addToPantryButton.className = 'add-to-pantry good';
    addToPantryButton.addEventListener("click", shoppingListToPantry)

    const basketImg = document.createElement('img');
    basketImg.src = '/static/images/basket.svg';
    basketImg.alt = 'basket';

    addToPantryButton.appendChild(basketImg);
    div.appendChild(addToPantryButton);

    const p = document.createElement('p');
    p.textContent = recipe_name;
    div.appendChild(p);

    document.getElementById("shopping-list").appendChild(div);
}


async function addMealToPantry(evt){
    let meal_name = this.parentNode.getAttribute("name")

    await fetch("/add_to_pantry", {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify({meal_name}), // body data type must match "Content-Type" header
    })

    createPantryRecipeBox(meal_name)
}

async function addMealToList(evt){
    let meal_name = this.parentNode.getAttribute("name")

    await fetch("/add_to_shopping_list", {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify({meal_name}), // body data type must match "Content-Type" header
    })

    createShoppingListRecipeBox(meal_name)
}

document.onkeydown = function(evt) {
    if ("key" in evt && (evt.key === "Escape" || evt.key === "Esc")) {
        try{
            document.getElementById("shopping-list-modal").remove()
        } catch {}
    }
};