async function addIngredientInput() {

    let ingredientCount = document.getElementsByClassName("ingredient").length

    let container = document.createElement("div")
    container.className = "ingredient"
    let $container = $(container);

    // Delete Ingredient Button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = "ingredientInput ingredientDelete"
    deleteButton.addEventListener('click', function() {
        container.remove(); // Remove the entire div and its contents
    });
    container.appendChild(deleteButton);

    // Quantity Input
    $container.append(createQuantityInput(ingredientCount));

    // Unit Input
    $container.append(createUnitInput(ingredientCount));

    // Name Input
    $container.append(await createNameInput(ingredientCount));

    document.getElementById("formMenu").appendChild(container)
}

function createUnitInput(ingredientCount) {
    let unitContainer = $("<div>").addClass("ingredientInput").attr("type", "unit");
    let unitLabel = $("<label>").attr("for", "unit" + ingredientCount).html("Unit:");
    let unitSelect = $("<select>").attr({
        "id": "unit" + ingredientCount,
        "name": "unit"
    });
    let unitOptions = [
        { value: "g", text: "g" },
        { value: "ml", text: "ml" },
    ];
    $.each(unitOptions, function(index, option) {
        $("<option>").attr("value", option.value).text(option.text).appendTo(unitSelect);
    });
    unitContainer.append(unitLabel, $("<br>"), unitSelect);
    return unitContainer
}

function createQuantityInput(ingredientCount) {
    let quantityContainer = $("<div>").addClass("ingredientInput").attr("type", "quantity");
    let quantityLabel = $("<label>").attr("for", "quantity" + ingredientCount).html("Quantity:");
    let quantityInput = $("<input>").attr({
        "type": "text",
        "id": "quantity" + ingredientCount,
        "name": "quantity",
        "value": ""
    });
    quantityContainer.append(quantityLabel, $("<br>"), quantityInput);
    return quantityContainer
}

async function createNameInput(ingredientCount) {
    const ALL_INGREDIENTS_RESPONSE = await fetch("/all_ingredients")
    const ALL_INGREDIENTS = await ALL_INGREDIENTS_RESPONSE.json()

    let ingredientContainer = $("<div>").addClass("ingredientInput").attr("type", "name");
    let ingredientLabel = $("<label>").attr("for", "ingredientName" + ingredientCount).html("Ingredient name:");
    let ingredientInput = $("<input>")
        .attr({
            "type": "text",
            "id": "ingredientName" + ingredientCount,
            "name": "name",
            "value": ""
        }).autocomplete({
            source: ALL_INGREDIENTS
        });
    ingredientContainer.append(ingredientLabel, $("<br>"), ingredientInput);
    return ingredientContainer
}

async function submitRecipe() {

    let ingredients = []

    let form = document.getElementsByClassName("ingredient")

    for (let i = 0; i < form.length; i++) {
        ingredients.push(
            {
                "name": getNameFromIngredient(form[i]),
                "unit": getUnitFromIngredient(form[i]),
                "amount": getQuantityFromIngredient(form[i])
            }
        )
    }

    let response = await fetch("/new_recipe", {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(
            {
                "recipe-name": document.getElementById("name").value,
                "ingredients": {ingredients}
            }
        ), // body data type must match "Content-Type" header
    })

    let responseJson = await response.json()
    if (responseJson === "success") {window.location.href = "/";}
    else {
        alert("There was an error submitting")
        console.log(response)
    }
}
function getUnitFromIngredient(ingredient) {
    let unitElement = ingredient.querySelector('[type="unit"]')
    return unitElement.querySelector('[name="unit"]').value
}

function getNameFromIngredient(ingredient) {
    let unitElement = ingredient.querySelector('[type="name"]')
    return unitElement.querySelector('[name="name"]').value
}

function getQuantityFromIngredient(ingredient) {
    let unitElement = ingredient.querySelector('[type="quantity"]')
    return unitElement.querySelector('[name="quantity"]').value
}

