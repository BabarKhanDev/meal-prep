from connect import connect
cluster = connect()

myCollection = cluster.bucket("data").collection("_default")
myDoc = myCollection.get("pantry").value["meals"]
print(myDoc)