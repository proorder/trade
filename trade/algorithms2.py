T1_T3_DEPTH = 150
INTERSECTION_DEPTH = 49
LOW = '<LOW>'
HIGH = '<HIGH>'

def algorithm_t1(table, start):
    p_t1 = None
    p_t3 = None
    p_t2 = None
    p_t4 = None
    intersection = None
    by_low = False

    while True:
        # На шаг ближе к декларативному стилю
        # Бывшая переменная start идет в ад, теперь все в параметре
        if start > table.shape[0]:
            return False
        p_t1, intersection, by_low = find_p1(table, start)
        if not p_t1:
            if start == table.shape[0]:
                return False
            start += 1
            continue
        p_t3 = find_p3(table, p_t1+1, intersection, by_low)
        if not p_t3:
            if start == table.shape[0]:
                return False
            start = p_t1+1
            continue
        p_t2 = find_interval_extremum(table, p_t1+1, p_t3-1, HIGH if by_low else LOW)
        if not p_t2:
            start = p_t1+1
            continue
        break

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

def find_p1(table, start):
    by_low = True
    p_t1 = None
    intersection = None
    try:
        if float(table.iloc[start+1][HIGH]) < float(table.iloc[start][HIGH]):
            p_t1 = find_low_extremum(table, start+1)
            intersection = find_level_of_intersection(table, p_t1, LOW)
        else:
            by_low = False
            p_t1 = find_high_extremum(table, start+1)
            intersection = find_level_of_intersection(table, p_t1, HIGH)
        if not intersection:
            from_point = start-50 if start-50 > -1 else 0
            extremum = find_interval_extremum(table, from_point, p_t1-1, HIGH if not by_low else LOW)
            if not extremum:
                return False, False, False
        return p_t1, intersection, by_low
    except Exception:
        start = table.shape[0]
        return False, False, False

def find_p3(table, p_t1, intersection, by_low):
    p_t3 = None
    stop_point = None
    try:
        if by_low:
            p_t3 = find_low_extremum(table, p_t1+1)
            # Проверка преодоления т3
            if table.iloc[p_t1][LOW] > table.iloc[p_t3][LOW]:
                return False
        else:
            p_t3 = find_high_extremum(table, p_t1+1)
            # Проверка преодоления т3
            if table.iloc[p_t1][HIGH] < table.iloc[p_t3][HIGH]:
                return False
        if p_t3 - p_t1 > T1_T3_DEPTH:
            return False
        return p_t3
    except Exception:
        start = table.shape[0]
        return False


def find_interval_extremum(table, from_point, to_point, direction):
    extremum = table.iloc[from_point][direction]
    ext_index = False
    for i, row in table.iloc[from_point:to_point].iterrows():
        if direction == LOW:
            if row[LOW] < extremum:
                if row[LOW] < table.iloc[i-1][LOW] and row[LOW] < table.iloc[i+1][LOW]:
                    extremum = row[LOW]
                    ext_index = i
        else:
            if row[HIGH] > extremum:
                if row[HIGH] > table.iloc[i-1][HIGH] and row[HIGH] > table.iloc[i+1][HIGH]:
                    extremum = row[HIGH]
                    ext_index = i
    return ext_index


def find_high_extremum(table, start_point):
    last_extremum = 0
    iterator = table.iloc[start_point:].iterrows()
    for i, row in iterator:
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
    iterator = table.iloc[start_point:].iterrows()
    for i, row in iterator:
        try:
            if float(table.iloc[i+1][LOW]) > float(row[LOW]) and float(table.iloc[i-1][LOW]) > float(row[LOW]):
                if last_extremum is not None and row[LOW] > table.iloc[last_extremum][LOW]:
                    return last_extremum
                else:
                    last_extremum = i
        except Exception:
            return False


def find_level_of_intersection(table, level_point, direction):
    iterator = table.iterrows()
    i = level_point
    while True:
        try:
            row = table.iloc[i]
        except Exception:
            return False
        if i < 0: return False
        if level_point - i > INTERSECTION_DEPTH: return False
        if direction == LOW:
            if row[LOW] < table.iloc[level_point][LOW]:
                return i
        if direction == HIGH:
            if row[HIGH] > table.iloc[level_point][HIGH]:
                return i
        i -= 1

def find_trend_line_breakdown(table, p1, p2, direction):
    interval = table.iloc[p1:p2]
    a = []
    if direction == LOW:
        extremum = table.iloc[p1][LOW]
        h = table.iloc[p2][direction] - extremum
        for i, el in interval.iterrows():
            if el[LOW] - extremum < (el.name-p1)*math.tan(h/(p2-p1)):
                a.append(i)
    else:
        extremum = table.iloc[p1][HIGH]
        h = extremum - table.iloc[p2][HIGH]
        for i, el in interval.iterrows():
            if extremum - el[HIGH] < (el.name-p1)*math.tan(h/(p2-p1)):
                a.append(i)
    return a

def bfe_by_low(table, t1, t3, direction):
    bfe = None # base fragmenting ext.
    lpi = None # level-priced intersection
    ext = None # bfe approving ext.
    for i in table.iloc[t1:t3].iterrows():
        if float(table.iloc[i][LOW]) < float(table.iloc[i+1][LOW]):
            continue
        else:
            if float(table.iloc[i+1][LOW]) < float(table.iloc[i+2][LOW]):
                bfe = table.iloc[i+1] #bfe candidate
                break
            else:
                i += 1
                continue
        print('no bfe whatsoever')
        
    if bfe:
        #ext = np.max(table.iloc[t1:bfe][LOW])
        for i in range(table.iloc[t1:bfe]):
            if float(table.iloc[i][LOW]) < float(table[bfe][LOW]):
                continue
            else:
                lpi = table.iloc[i]
                print('bfe level-priced intersec. in {}'.format(i))
                break
        
    if bfe and lpi:               
        if find_interval_extremum(table, lpi, bfe, HIGH):
            return print(find_interval_extremum(table, lpi, bfe, HIGH))
        else:
            return print('there\'s no approving ext. => no bfe => t3 is ok')

def bfe_by_high(table, t1, t3, direction):
    bfe = None # base fragmenting ext.
    lpi = None # level-priced intersection
    ext = None # bfe approving ext.
    for i in table.iloc[t1:t3].iterrows():
        if float(table.iloc[i][HIGH]) > float(table.iloc[i+1][HIGH]):
            continue
        else:
            if float(table.iloc[i+1][HIGH]) > float(table.iloc[i+2][HIGH]):
                bfe = table.iloc[i+1] #bfe candidate                                               
                break
            else:
                i += 1
                continue
        print('no bfe whatsoever')

    if bfe:
        #ext = np.max(table.iloc[t1:bfe][LOW])                                                     
        for i in range(table.iloc[t1:bfe]):
            if float(table.iloc[i][HIGH]) > float(table[bfe][HIGH]):
                continue
            else:
                lpi = table.iloc[i]
                print('bfe level-priced intersec. in {}'.format(i))
                break

    if bfe and lpi:
        if find_interval_extremum(table, lpi, bfe, LOW):
            return print(find_interval_extremum(table, lpi, bfe, LOW))
        else:
            return print('there\'s no approving ext. => no bfe => t3 is ok')


def base_fragmenting_extremums(table, t1, t3, direction):
    if direction == LOW:
        return bfe_by_low(table, t1, t3, direction)
    else:
        return bfe_by_high(table, t1, t3, direction)


        
