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
        p_t2 = find_potential_t1_up(table, p_t1+1)
        p_t4 = find_potential_t1_up(table, p_t2+1)
        if p_t2:
            # TODO: Проверить т3 на пробитие уровня т1
            #MARK: - stupid unproven breakdown check for HIGH t1
            for bar in table[p_t1:p_t3]:
                if table['<CLOSE>'][bar] < table["<OPEN>"][bar]:
                    if table['<OPEN>'][bar] > np.quantile(table[p_t1:p_t3], 1/bar+1):
                        continue
                    else:
                        print("[t3:t1] is broken down, search for another t3")
                else: 
                    if table['<CLOSE>'][bar] > np.quantile(table[p_t1:p_t3], 1/bar+1):
                        continue
                    else:
                        print("[t3:t1] is broken down, search for another t3")

            # MARK: 
            return {
                't1': {
                    'LOW': p_t1,
                    'HIGH': None
                },
                't3': {
                    'LOW': p_t3,
                    'HIGH': None
                },
                't2': {
                    'LOW': None,
                    'HIGH': p_t2
                },
                't4': {
                    'LOW': None,
                    'HIGH': p_t4
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
        p_t2 = find_potential_t1_down(table, p_t1+1)
        p_t4 = find_potential_t1_down(table, p_t2+1)
        if p_t2:
            # TODO: Проверить т3 на пробитие уровня т1
            #MARK: - stupid unproven breakdown check for LOW t1
            for bar in table[p_t1:p_t3]:
                if table['<CLOSE>'][bar] < table["<OPEN>"][bar]:
                    if table['<CLOSE>'][bar] < np.quantile(table[p_t1:p_t3], 1/bar+1):
                        continue
                    else:
                        print("[t3:t1] is broken down, search for another t3")
                else: 
                    if table['<OPEN>'][bar] < np.quantile(table[p_t1:p_t3], 1/bar+1):
                        continue
                    else:
                        print("[t3:t1] is broken down, search for another t3")

                        
            return {
                't1': {
                    'LOW': None,
                    'HIGH': p_t1
                },
                't3': {
                    'LOW': None,
                    'HIGH': p_t3
                },
                't2': {
                    'LOW': p_t2,
                    'HIGH': None
                },
                't4': {
                    'LOW': p_t4,
                    'HIGH': None
                }
            }
        else:
            # TODO: Не нашел t2
            return False


def is_aligned_low(table, t1, t2):
    if table.iloc[t1]['<LOW>'] < table.iloc[t2]['<LOW>']:
        return True
    else:
        return False


def is_aligned_high(table, t1, t2):
    if table.iloc[t1]['<HIGH>'] > table.iloc[t2]['<HIGH>']:
        return True
    else:
        return False


def find_potential_t1_up(table, start):
    iter = table.iterrows()
    for count, (index, row) in enumerate(iter):
        if count < start: continue
        try:
            if float(row['<HIGH>']) > float(table.iloc[count+1]['<HIGH>']):
                if not is_aligned_high(table, count-1, count):
                    return count
        except Exception:
            return False


def find_potential_t1_down(table, start):
    iter = table.iterrows()
    for count, (index, row) in enumerate(iter):
        if count < start: continue
        try:
            if float(row['<LOW>']) < float(table.iloc[count+1]['<LOW>']):
                if not is_aligned_low(table, count-1, count):
                    return count
        except Exception:
            return False