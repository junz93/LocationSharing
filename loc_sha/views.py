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
        if request.GET['type'] == 0:    # create a new group
            while n in data:
                n = (n + 1) % M
            group = n
            n = (n + 1) % M
            data[group] = list()
        else:                           # join a group
            group = int(request.GET['group'])
            if group not in data:
                return JsonResponse(False, safe=False)
        cid = len(data[group])      # client id (an index of array)
        data[group].append([0, 0, request.GET['trans']])
        return JsonResponse({'group': group, 'id': cid})

    return render(request, 'loc_sha/index.html')


def msg(request):
    global n
    global data
    group = request.GET['group']
    cid = request.GET['id']
    item = data[group][cid]
    item[0] = request.GET['lat']
    item[1] = request.GET['lng']
    return JsonResponse(data[group], safe=False)
