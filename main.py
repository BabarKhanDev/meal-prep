from connect import connect
from util import setup_connection_info, add_recipe, add_ingredient, get_planned_meals


def main():
    try:
        setup_connection_info()
        cluster = connect()
    except:
        print("Error connecting to cluster, please check that the information in connection-info.txt is correct")
        exit()

    bucket_name = "data"
    scope_name = "_default"
    recipe_collection_name = "recipes"
    ingredient_collection_name = "ingredients"

    recipes = (cluster
               .bucket(bucket_name)
               .scope(scope_name)
               .collection(recipe_collection_name)
               )

    ingredients = (cluster
                   .bucket(bucket_name)
                   .scope(scope_name)
                   .collection(ingredient_collection_name)
                   )

    # ingredient_docs = cluster.query("select META().id from `data`.`_default`.`ingredients`")
    # recipe_docs = cluster.query("select META().id from `data`.`_default`.`recipes`")
    # print("Ingredients:")
    # for row in ingredient_docs.rows():
    #     print(f"Found row: {row}")
    #
    # print("\nRecipes:")
    # for row in recipe_docs.rows():
    #     print(f"Found row: {row}")

    ingredients_list = [
        {"name": "bread", "unit": "g", "amount": 2},
        {"name": "tomato", "unit": "g", "amount": 40},
        {"name": "quorn", "unit": "g", "amount": 80}
    ]
    for ingredient in ingredients_list:
        add_ingredient(ingredients, ingredient)
    add_recipe(recipes, "burger", ingredients_list)

    result = get_planned_meals(cluster)
    print(result.content_as[dict])


if __name__ == "__main__":
    main()
