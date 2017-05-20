from django.shortcuts import render
from django.http import JsonResponse
# from .models import Group, Member
# from .tasks import t_exit
from .cassa_models import Group, Member
from random import randrange
import uuid

# Create your views here.


def index(request):
    if request.is_ajax():
        name = request.GET['name']
        # trans = request.GET['trans']
        # create a new group
        if request.GET['type'] == "0":
            dest = request.GET['dest']
            gid = randrange(10**7)      # generate a random group id
            while Group.objects.filter(id=gid):
                gid = randrange(10**7)
            g = Group.create(id=gid, num=1)      # add a new group
        # join an existing group
        else:
            gid = int(request.GET['group'])
            # group number does not exist
            if not Group.objects.filter(id=gid):
                return JsonResponse(False, safe=False)
            # increment the number of members in the group
            g = Group.objects.get(id=gid)
            g.num += 1
            g.save()

        m = Member.create(name=name, group_id=gid)  # add a new member belonging to the group
        return JsonResponse({'group': g.id, 'dest': g.dest, 'id': m.id.hex})

    return render(request, 'loc_sha/index.html')


def msg(request):
    gid = int(request.GET['group'])
    mid = uuid.UUID(request.GET['id'])
    if not Member.objects.filter(id=mid):
        return JsonResponse(False, safe=False)
    Member.objects.filter(id=mid).update(lat=request.GET['lat'], lng=request.GET['lng'])
    members = Member.objects.filter(group_id=gid)
    a = [{'name': m.name, 'lat': m.lat, 'lng': m.lng} for m in members if m.id != mid]
    return JsonResponse(a, safe=False)
    # return JsonResponse([[m.lat, m.lng, m.name] for m in members], safe=False)


def stop(request):
    gid = int(request.GET['group'])
    mid = uuid.UUID(request.GET['id'])
    # t_exit.delay(data, group, cid)
    Member.objects.get(id=mid).delete()
    g = Group.objects.get(id=gid)
    if g.num == 1:
        Group.objects.get(id=gid).delete()
    else:
        g.num -= 1
        g.save()
    return JsonResponse(True, safe=False)
