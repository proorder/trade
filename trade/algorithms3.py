T1_T3_DEPTH = 150
INTERSECTION_DEPTH = 49
LOW = '<LOW>'
HIGH = '<HIGH>'
OPEN = '<OPEN>'
CLOSE = '<CLOSE>'

def algorithm_t1(table, arg_start):
    p_t1 = None
    p_t2 = None
    p_t3 = None
    p_t4 = None
    intersection = None
    start = arg_start
    by_low = None
    while True:
        p_t1, by_low = find_p1(table, start)
        if not p_t1:
            return False
        intersection = find_level_of_intersection(table, p_t1, by_low)
        if not intersection:
            start += 1
            continue
        p_t2 = find_extremum(table, p_t1+1, not by_low)
        if not p_t2:
            if start+1 != table.shape[0]:
                start += 1
                continue
            else:
                return False
        np_t1 = find_extremum(table, p_t2+1, by_low)
        if not np_t1:
            if start+1 != table.shape[0]:
                start += 1
                continue
            else:
                return False
        if not compare_p_np(table, p_t1, np_t1, by_low):
            if start+1 != table.shape[0]:
                start += 1
                continue
            else:
                return False
        p_t3 = np_t1
        p_t4 = find_extremum(table, p_t3+1, not by_low)
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


def compare_p_np(table, p_t1, np_t1, by_low):
    if by_low:
        if table.iloc[p_t1][LOW] > table.iloc[np_t1][LOW]:
            return False
    else:
        if table.iloc[p_t1][HIGH] < table.iloc[np_t1][HIGH]:
            return False
    return True


def find_p1(table, i):
    if float(table.iloc[i+1][CLOSE]) < float(table.iloc[i][CLOSE]):
        return find_extremum(table, i+1, True), True
    else:
        return find_extremum(table, i+1, False), False


def find_extremum(table, start_point, direction_by_low):
    last_extremum = None if direction_by_low else start_point
    iterator = table.iloc[start_point:].iterrows()
    if direction_by_low:
        for i, row in iterator:
            try:
                if float(table.iloc[i+1][LOW]) > float(row[LOW]) and float(table.iloc[i-1][LOW]) > float(row[LOW]):
                    if last_extremum is not None and row[LOW] > table.iloc[last_extremum][LOW]:
                        return last_extremum
                    last_extremum = i
            except IndexError:
                return False
    else:
        for i, row in iterator:
            try:
                if float(table.iloc[i+1][HIGH]) < float(row[HIGH]) and float(table.iloc[i-1][HIGH]) < float(row[HIGH]):
                    if row[HIGH] < table.iloc[last_extremum][HIGH]:
                        return last_extremum
                    last_extremum = i
            except IndexError:
                return False


def find_interval_extremum(table, from_point, to_point, by_low):
    extremum = table.iloc[from_point][LOW if by_low else HIGH]
    ext_index = False
    for i, row in table.iloc[from_point:to_point].iterrows():
        if by_low:
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


def find_level_of_intersection(table, level_point, by_low):
    from_point = level_point-50 if level_point-50 > -1 else 0
    extremum = find_interval_extremum(table, from_point, level_point-1, by_low)
    if not extremum:
        return False
    if by_low:
        if table.iloc[extremum][LOW] < table.iloc[level_point][LOW]:
            # Что-то сделать
            pass
        else:
            return extremum
    else:
        if table.iloc[extremum][HIGH] > table.iloc[level_point][HIGH]:
            pass
        else:
            return extremum

