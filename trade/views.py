from django.views.generic import View
from django.shortcuts import render
from django.http import HttpResponseRedirect
import pandas as pd, json
from .algorithms import algorithm_t1


def upload_file(request):
    print(request.FILES)
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
        self.points = algorithm_t1(table)
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
            'csv': self.getCSVJSON(),
            'points': json.dumps(self.points)
        }
        return render(request, 'index.html', context=context)
