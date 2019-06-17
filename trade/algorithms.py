LOW = '<LOW>'
HIGH = '<HIGH>'

def algorithm_t1(table):
    start = 0
    p_t1 = None
    p_t3 = None
    p_t2 = None
    p_t4 = None
    by_low = False
    while True:
        try:
            if float(table.iloc[start+1][HIGH]) < float(table.iloc[start][HIGH]):
                # Search for the lowest
                by_low = True
                p_t1 = find_low_extremum(table, start+1)
                intersection = find_level_of_intersection(table, p_t1, LOW)
                if intersection:
                    # Поиск экстремума на участке
                    p_t3 = find_interval_extremum(table, p_t1+1, intersection-1, LOW)
                    if p_t3:
                        p_t2 = find_interval_extremum(table, p_t1+1, p_t3-1, HIGH)
                        p_t4 = find_high_extremum(table, p_t2+1)
                        while True:
                            if p_t4 == False or table.iloc[p_t4][HIGH] > table.iloc[p_t2][HIGH]:
                                break
                            p_t4 = find_high_extremum(table, p_t4+1)
                        if p_t4 == False:
                            # new p3
                            # заглушка
                            p_t4 = find_high_extremum(table, p_t4+1)
                        else:
                            # p_t3 = find_interval_extremum(table, p_t1+1, p_t4-1, LOW)
                            break
                    else:
                        start += 1
                else:
                    # Поиск экстремума справа налево по p_t1
                    p_t3 = find_low_extremum(table, p_t1+1)
                    if p_t3:
                        p_t2 = find_interval_extremum(table, p_t1+1, p_t3-1, HIGH)
                        # Поиск точки 4
                        p_t4 = find_high_extremum(table, p_t2+1)
                        while True:
                            if p_t4 == False or table.iloc[p_t4][HIGH] > table.iloc[p_t2][HIGH]:
                                break
                            p_t4 = find_high_extremum(table, p_t4+1)
                        if p_t4 == False:
                            # new p3
                            # заглушка
                            p_t4 = find_high_extremum(table, p_t4+1)
                        else:
                            # p_t3 = find_interval_extremum(table, p_t1+1, p_t4-1, LOW)
                            break
                    else:
                        start += 1
            else:
                # Search for the highest
                by_low = False
                p_t1 = find_high_extremum(table, start+1)
                intersection = find_level_of_intersection(table, p_t1, HIGH)
                if intersection:
                    # Поиск экстремума на участке
                    p_t3 = find_interval_extremum(table, p_t1+1, intersection-1, HIGH)
                    if p_t3:
                        p_t2 = find_interval_extremum(table, p_t1+1, p_t3-1, LOW)
                        # Поиск точки 4
                        p_t4 = find_low_extremum(table, p_t2+1)
                        while True:
                            if p_t4 == False or table.iloc[p_t4][LOW] < table.iloc[p_t2][LOW]:
                                break
                            p_t4 = find_low_extremum(table, p_t4+1)
                        if p_t4 == False:
                            # new p3
                            # заглушка
                            p_t4 = find_low_extremum(table, p_t4+1)
                        else:
                            # p_t3 = find_interval_extremum(table, p_t1+1, p_t4-1, LOW)
                            break
                    else:
                        start += 1
                else:
                    # Поиск экстремума справа налево по p_t1
                    p_t3 = find_high_extremum(table, p_t1+1)
                    if p_t3:
                        p_t2 = find_interval_extremum(table, p_t1+1, p_t3-1, LOW)
                        # Поиск точки 4
                        p_t4 = find_low_extremum(table, p_t2+1)
                        while True:
                            if p_t4 == False or table.iloc[p_t4][LOW] < table.iloc[p_t2][LOW]:
                                break
                            p_t4 = find_low_extremum(table, p_t4+1)
                        print(p_t4 )
                        if p_t4 == False:
                            # new p3
                            # заглушка
                            p_t4 = find_low_extremum(table, p_t4+1)
                        else:
                            # p_t3 = find_interval_extremum(table, p_t1+1, p_t4-1, LOW)
                            break
                    else:
                        start += 1
        except Exception:
            print('Error')
            return
    return {
        't1': {
            'LOW': p_t1 if by_low else None,
            'HIGH': None if by_low else p_t1
        },
        't3': {
            'LOW': p_t3 if by_low else None,
            'HIGH': None if by_low else p_t3
        },
        't2': {
            'LOW': None if by_low else p_t2,
            'HIGH': p_t2 if by_low else None
        },
        't4': {
            'LOW': None if by_low else p_t4,
            'HIGH': p_t4 if by_low else None
        }
    }


def find_interval_extremum(table, from_point, to_point, direction):
    extremum = table.iloc[from_point][direction]
    ext_index = 0
    for i, (index, row) in enumerate(table.iterrows()):
        if i < from_point: continue
        if i > to_point: break
        if direction == LOW:
            if row[LOW] < extremum:
                extremum = row[LOW]
                ext_index = i
        else:
            if row[HIGH] > extremum:
                extremum = row[HIGH]
                ext_index = i
    return ext_index


def find_high_extremum(table, start_point):
    last_extremum = 0
    iterator = table.iterrows()
    for i, (index, row) in enumerate(iterator):
        if i < start_point: continue
        try:
            if float(table.iloc[i+1][HIGH]) < float(row[HIGH]) and float(table.iloc[i-1][HIGH]) < float(row[HIGH]):
                if row[HIGH] < table.iloc[last_extremum][HIGH]:
                    return last_extremum
                else:
                    last_extremum = i
        except Exception:
            return False


def find_low_extremum(table, start_point):
    last_extremum = None
    iterator = table.iterrows()
    for i, (index, row) in enumerate(iterator):
        if i < start_point: continue
        try:
            if table.iloc[i+1][LOW] > row[LOW] and table.iloc[i-1][LOW] > row[LOW]:
                if last_extremum is not None and row[LOW] > table.iloc[last_extremum][LOW]:
                    return last_extremum
                else:
                    last_extremum = i
        except Exception:
            return False


def find_level_of_intersection(table, level_point, direction):
    iterator = table.iterrows()
    for i, (index, row) in enumerate(iterator):
        if i < level_point+1: continue
        if i - level_point+1 > 49: return False
        if direction == LOW:
            if row[LOW] < table.iloc[level_point][LOW]:
                return i
        if direction == HIGH:
            if row[HIGH] > table.iloc[level_point][HIGH]:
                return i
        return False

