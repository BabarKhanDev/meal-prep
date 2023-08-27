import os

import couchbase.exceptions
from couchbase import collection
from couchbase import cluster

# Constants
VALID_UNITS = ["ml", "L", "kg", "g"]


def setup_connection_info():
    if os.path.exists("connection-info.txt"):
        return

    with open("connection-info.txt", "w") as file:
        file.write("cluster-ip-address=127.0.0.1\n")
        file.write("username=Administrator\n")
        file.write("password=password\n")

    print("Please open connection-info.txt and fill in cluster details")
    exit()


def extract_connection_info():
    with open("connection-info.txt", "r") as file:
        connection_string = file.readline().split("=")[1].strip()
        username = file.readline().split("=")[1].strip()
        password = file.readline().split("=")[1].strip()

    return connection_string, username, password


def add_ingredient(ingredient_collection: collection, ingredient: dict[str, str | None]) -> None:
    doc = {"name": ingredient["name"], "unit": ingredient["unit"]}
    if ingredient["unit"] not in VALID_UNITS:
        doc["unit"] = None

    ingredient_collection.upsert(doc["name"], doc)


def add_recipe(recipe_collection: collection, name: str, ingredients: [dict[str, str | None]]) -> None:
    recipe_collection.upsert(name, {"ingredients": ingredients})


def get_planned_meals(data_cluster: cluster):
    default_collection = data_cluster.bucket("data").scope("_default").collection("_default")
    try:
        return default_collection.get("planned-meals")
    except couchbase.exceptions.DocumentNotFoundException:
        default_collection.insert("planned-meals", {})
        return {}
