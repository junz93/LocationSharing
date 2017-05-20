from cassandra.cqlengine import connection
from cassandra.cqlengine.management import create_keyspace_simple
from cassandra.cqlengine.management import sync_table
from .cassa_models import Group, Member
import os

if os.getenv('CQLENG_ALLOW_SCHEMA_MANAGEMENT') is None:
    os.environ['CQLENG_ALLOW_SCHEMA_MANAGEMENT'] = '1'
    connection.setup(['172.31.4.92'], 'location')
    cluster = connection.cluster
    keyspaces = cluster.metadata.keyspaces
    if 'location' not in keyspaces:
        create_keyspace_simple('location', replication_factor=2)
    tables = keyspaces['location'].tables
    if 'group' not in tables:
        sync_table(Group)
    if 'member' not in tables:
        sync_table(Member)
