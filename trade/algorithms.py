import numpy as np
import pandas as pd

def ext_srch(table, bar):
    reversed_table = table['<CLOSE>'][::-1]
    start = reversed_table[bar]
    print('Rev: ' + reversed_table)
    print('Start' + start)
    t3_candidate = 0
    t3_candidate_index = 0
    
    for index in range(len(reversed_table)):
        if reversed_table[index+1] == start:
            t3_candidate = reversed_table[index+1]
            t3_candidate_index = index+1
            break
   
    if start > max(reversed_table[bar+1:t3_candidate_index]):
       print("t1 is high with approval extremum: {}".format(min(reversed_table[bar+1:t3_candidate_index])))
       print(reversed_table[bar+1:t3_candidate_index])
    else:
       print("t1 is low with approval extremum: {}".format(max(reversed_table[bar+1:t3_candidate_index])))
       print(reversed_table[bar+1:t3_candidate_index])
       print("____next is____")
       print(reversed_table[t3_candidate_index+1])
    
    if start == reversed_table[0]:
        print("AAAA")
        print(reversed_table[0])


def algorithm_t1(table):
    start = 0
    while True:
        iter = approve_t1(table, start)
        if iter:
            return iter
        else:
            # TODO: Проверить количество итераций по ТЗ
            start += 1


def approve_t1(table, start):
    t1 = table.iloc[start]
    if float(t1['<OPEN>']) < float(t1['<CLOSE>']):
        # HIGH точка
        # Ищем по LOW
        p_t1 = find_potential_t1_down(table, start+1)
        p_t3 = find_potential_t1_down(table, p_t1+1)
        p_t2 = find_potential_t1_up(table, start+1)
        if p_t2:
            # TODO: Проверить т3 на пробитие уровня т1
            return {
                't1': {
                    'LOW': p_t1,
                    'HIGH': None
                },
                't3': {
                    'LOW': p_t3,
                    'HIGH': None
                }
            }
        else:
            # TODO: Не нашел t2
            return False
    else:
        # LOW точка
        # Ищем по HIGH
        p_t1 = find_potential_t1_up(table, start+1)
        p_t3 = find_potential_t1_up(table, p_t1+1)
        p_t2 = find_potential_t1_down(table, start+1)
        if p_t2:
            # TODO: Проверить т3 на пробитие уровня т1
            return {
                't1': {
                    'LOW': None,
                    'HIGH': p_t1
                },
                't3': {
                    'LOW': None,
                    'HIGH': p_t3
                }
            }
        else:
            # TODO: Не нашел t2
            return False


def find_potential_t1_up(table, start):
    iter = table.iterrows()
    for count, (index, row) in enumerate(iter):
        if count < start: continue
        try:
            if float(row['<HIGH>']) > float(table.iloc[count+1]['<HIGH>']):
                return count
        except Exception:
            return False


def find_potential_t1_down(table, start):
    iter = table.iterrows()
    for count, (index, row) in enumerate(iter):
        if count < start: continue
        try:
            if float(row['<LOW>']) < float(table.iloc[count+1]['<LOW>']):
                return count
        except Exception:
            return False
