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
            data[group] = {'dest': dest, 'member': list(), 'num': 0}
        # join a group
        else:
            group = int(request.GET['group'])
            # group number is invalid
            if group not in data:
                return JsonResponse(False, safe=False)
            dest = data[group]['dest']
        cid = len(data[group]['member'])      # client id (an index of array)
        data[group]['member'].append([0, 0, request.GET['trans'], request.GET['name']])
        data[group]['num'] += 1
        return JsonResponse({'group': group, 'dest': dest, 'id': cid})

    return render(request, 'loc_sha/index.html')


def msg(request):
    global data
    group = int(request.GET['group'])
    if group not in data:
        return JsonResponse(False, safe=False)
    cid = int(request.GET['id'])
    item = data[group]['member'][cid]
    if item is None:
        return JsonResponse(False, safe=False)
    item[0] = request.GET['lat']
    item[1] = request.GET['lng']
    return JsonResponse(data[group]['member'], safe=False)


def exit(request):
    global data
    group = int(request.GET['group'])
    cid = int(request.GET['id'])
    data[group]['member'][cid] = None
    data[group]['num'] -= 1
    if data[group]['num'] == 0:
        del data[group]
    return JsonResponse(True, safe=False)
