import uuid
from cassandra.cqlengine.models import Model
from cassandra.cqlengine import columns


class Group(Model):
    id = columns.Integer(primary_key=True)
    dest_lat = columns.Double(default=0.0)
    dest_lng = columns.Double(default=0.0)
    num = columns.Integer()


class Member(Model):
    id = columns.UUID(primary_key=True, default=uuid.uuid4)
    name = columns.Text()
    group_id = columns.Integer(index=True)
    lat = columns.Double(default=0.0)
    lng = columns.Double(default=0.0)
