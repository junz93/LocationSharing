from django.shortcuts import render
from django.http import JsonResponse
# from .models import Group, Member
# from .tasks import t_exit

# Create your views here.


def index(request):
    if request.is_ajax():
        name = request.GET['name']
        trans = request.GET['trans']
        # create a new group
        if request.GET['type'] == "0":
            dest = request.GET['dest']
            g = Group.objects.create(dest=dest, num=1)      # add a new group
        # join a group
        else:
            gid = int(request.GET['group'])
            # group number does not exist
            if not Group.objects.filter(id=gid).exists():
                return JsonResponse(False, safe=False)
            g = Group.objects.get(id=gid)
            g.num += 1
            g.save()
        m = Member.objects.create(name=name, group=g, trans=trans)  # add a new member belonging to the group
        return JsonResponse({'group': g.id, 'dest': g.dest, 'id': m.id})

    return render(request, 'loc_sha/index.html')


def msg(request):
    gid = int(request.GET['group'])
    mid = int(request.GET['id'])
    if not Member.objects.filter(id=mid).exists():
        return JsonResponse(False, safe=False)
    Member.objects.filter(id=mid).update(lat=request.GET['lat'], lng=request.GET['lng'])
    members = Member.objects.filter(group__id=gid).exclude(id=mid).values('lat', 'lng', 'name', 'trans')
    return JsonResponse(list(members), safe=False)
    # return JsonResponse([[m.lat, m.lng, m.name, m.trans] for m in members], safe=False)


def exit(request):
    gid = int(request.GET['group'])
    mid = int(request.GET['id'])
    # t_exit.delay(data, group, cid)
    Member.objects.get(id=mid).delete()
    g = Group.objects.get(id=gid)
    if g.num == 1:
        Group.objects.get(id=gid).delete()
    else:
        g.num -= 1
        g.save()
    return JsonResponse(True, safe=False)
