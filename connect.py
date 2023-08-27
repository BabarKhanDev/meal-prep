# This file is used for functions that will allow the user to connect to a couchbase cluster
from datetime import timedelta

from couchbase.auth import PasswordAuthenticator
from couchbase.cluster import Cluster
from couchbase.options import ClusterOptions

from util import extract_connection_info


def connect():
    connection_string, username, password = extract_connection_info()

    auth = PasswordAuthenticator(
        username,
        password,
    )

    cluster = Cluster(f"couchbase://{connection_string}", ClusterOptions(auth))
    cluster.wait_until_ready(timedelta(seconds=5))

    return cluster
