from django.db import models

# Create your models here.

#
# class Group(models.Model):
#     dest = models.CharField(max_length=100)     # destination of the group
#     num = models.IntegerField()                 # number of members in the group
#
#
# class Member(models.Model):
#     name = models.CharField(max_length=50)  # name of the member
#     group = models.ForeignKey(Group)        # group of the member
#     lat = models.FloatField(default=0.0)    # latitude of the member
#     lng = models.FloatField(default=0.0)    # longitude of the members
