from django.shortcuts import render
from django.http import JsonResponse

# Create your views here.

M = 10**8
n = 0
data = dict()


def index(request):
    global M
    global n
    global data
    if request.is_ajax():
        # create a new group
        if request.GET['type'] == "0":
            while n in data:
                n = (n + 1) % M
            group = n
            n = (n + 1) % M
            dest = request.GET['dest']
            data[group] = {'dest': dest, 'member': list()}
        # join a group
        else:
            group = int(request.GET['group'])
            # group number is invalid
            if group not in data:
                return JsonResponse(False, safe=False)
            dest = data[group]['dest']
        cid = len(data[group]['member'])      # client id (an index of array)
        data[group]['member'].append([0, 0, request.GET['trans'], request.GET['name']])
        return JsonResponse({'group': group, 'dest': dest, 'id': cid})

    return render(request, 'loc_sha/index.html')


def msg(request):
    global n
    global data
    group = int(request.GET['group'])
    cid = int(request.GET['id'])
    item = data[group]['member'][cid]
    item[0] = request.GET['lat']
    item[1] = request.GET['lng']
    return JsonResponse(data[group]['member'], safe=False)
