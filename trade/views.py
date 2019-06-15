from django.views.generic import View
from django.shortcuts import render
import pandas as pd, json
from .algorithms import algorithm_t1

class MainView(View):
    def getCSVJSON(self):
        table = pd.read_csv('static/EURUSD.csv')
        output = []
        print(algorithm_t1(table.iloc[::-1]))
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
        context = {'csv': self.getCSVJSON()}
        return render(request, 'index.html', context=context)
