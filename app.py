from flask import Flask, jsonify, render_template, request
from connect import connect
from util import setup_connection_info
import couchbase.subdocument as SD

app = Flask(__name__)
try:
    setup_connection_info()
    cluster = connect()

    bucket_name = "data"
    scope_name = "_default"
    recipe_collection_name = "recipes"

    recipes = cluster.bucket(bucket_name).scope(scope_name).collection(recipe_collection_name)
    data_bucket = cluster.bucket(bucket_name).default_collection()

    units = ["ml", "g"]
except:
    print("Error connecting to cluster, please check that the information in connection-info.txt is correct")
    exit()


@app.route("/")
def hello():
    return render_template("homepage.html")


@app.route("/new_recipe", methods=['POST', 'GET'])
def new_recipe():
    if request.method == 'GET':
        return render_template("new_recipe.html")
    else:
        data = request.get_json()

        # Add the recipe
        recipes.upsert(data["recipe-name"], data["ingredients"])

        return jsonify("success")


@app.route("/all_recipes")
def all_recipes():
    out = []
    recipe_docs = cluster.query("select META().id as name, recipes.* from `data`.`_default`.`recipes`")
    for recipe in recipe_docs.rows():
        out.append({"name": recipe["name"], "ingredients": recipe["ingredients"]})
    return out


@app.route("/recipe/<recipe_name>")
def get_recipe(recipe_name):
    return recipes.get(recipe_name).value


@app.route("/all_ingredients")
def all_ingredients():
    out = []
    ingredients = cluster.query(
        """select distinct LOWER(ingredients.name) as name
           from `data`.`_default`.`recipes`
           unnest ingredients"""
    )
    for ingredient in ingredients:
        out.append(ingredient["name"])
    return out


@app.route("/all_ingredients_dense")
def all_ingredients_dense():
    out = []
    ingredients = cluster.query(
        """select distinct LOWER(ingredients.name) as name, ingredients.unit
        from `data`.`_default`.`recipes`
        unnest ingredients"""
    )
    for ingredient in ingredients:
        out.append({"name": ingredient["name"], "unit": ingredient["unit"]})
    return out


@app.route("/add_to_pantry", methods=['POST'])
def add_to_pantry():
    data = request.get_json()
    cluster.bucket("data").collection("_default").mutate_in("pantry", (SD.array_append(
        "meals", data["meal_name"]),))
    return "success"


@app.route("/add_to_shopping_list", methods=['POST'])
def add_to_shopping_list():
    data = request.get_json()
    cluster.bucket("data").collection("_default").mutate_in("shopping-list", (SD.array_append(
        "meals", data["meal_name"]),))
    return "success"


@app.route("/shopping_list")
def get_shopping_list():
    shopping_list = data_bucket.get("shopping-list")
    return shopping_list.value["meals"]


@app.route("/pantry")
def get_pantry_list():
    pantry_list = data_bucket.get("pantry")
    return pantry_list.value["meals"]


@app.route("/remove_from_shopping_list", methods=['POST'])
def remove_from_shopping_list():
    data = request.get_json()
    shopping_list = data_bucket.get("shopping-list").value["meals"]
    index = shopping_list.index(data)
    del shopping_list[index]
    data_bucket.upsert("shopping-list", {"meals": shopping_list})
    return "success"


@app.route("/remove_from_pantry", methods=['POST'])
def remove_from_pantry():
    data = request.get_json()
    pantry_list = data_bucket.get("pantry").value["meals"]
    index = pantry_list.index(data)
    del pantry_list[index]
    data_bucket.upsert("pantry", {"meals": pantry_list})
    return "success"


@app.route("/create_shopping_list", methods=['POST'])
def create_shopping_list():
    data = request.get_json()
    out = {}
    for recipe_name in data:
        ingredients = recipes.get(recipe_name).value["ingredients"]
        for ingredient in ingredients:
            if ingredient["name"] not in out:
                # TODO, this needs updating to our master list of units
                out[ingredient["name"]] = {"ml": 0, "g": 0}
            out[ingredient["name"]][ingredient["unit"]] += float(ingredient["amount"])

    print(out)
    return out

@app.route("/shopping_list_plain")
def shopping_list_plain():
    return render_template("shopping_list.html")