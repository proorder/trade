from django.views.generic import View
from django.shortcuts import render
from django.http import HttpResponseRedirect, HttpResponse
import pandas as pd, json
from .algorithms2 import algorithm_t1


def select(request):
    post = json.loads(request.body.decode('utf-8'))
    table = pd.read_csv('static/EURUSD.csv')
    points = algorithm_t1(table, post['id'])
    return HttpResponse(json.dumps(points), content_type='application/json')


def upload_file(request):
    handle_uploaded_file(request.FILES['csv'])
    return HttpResponseRedirect('/')


def handle_uploaded_file(f):
    with open('static/EURUSD.csv', 'wb+') as destination:
        for chunk in f.chunks():
            destination.write(chunk)


class MainView(View):
    def getCSVJSON(self):
        table = pd.read_csv('static/EURUSD.csv')
        output = []
        for index, row in table.iterrows():
            output.append([
                    row['<OPEN>'],
                    row['<HIGH>'],
                    row['<LOW>'],
                    row['<CLOSE>'],
                    row['<TIME>'],
                ])
        return json.dumps(output)

    def get(self, request, *args, **kwargs):
        context = {
            'csv': self.getCSVJSON()
        }
        return render(request, 'index.html', context=context)
