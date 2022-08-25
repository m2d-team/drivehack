from geopy import distance

from maps.models import DrawingPoint

'''
coords for test:
[37.56885102020473, 55.77097100672404]
[37.56910848121305, 55.77069342942761]
[37.56777826600262, 55.77028309415172]
[37.56752080499436, 55.77056067436962]
[37.56885102020473, 55.77097100672404]
'''

coordinates = [
    [37.56885102020473, 55.77097100672404],
    [37.56910848121305, 55.77069342942761],
    [37.56777826600262, 55.77028309415172],
    [37.56752080499436, 55.77056067436962],
    [37.56885102020473, 55.77097100672404]
]


def lower_bound_index(value, array, pos):
    # возвращаем последний элемент, который <= value
    l, r = 0, len(array)

    while (r - l > 1):
        mid = (r + l) // 2

        if array[mid][pos] <= value:
            l = mid
        else:
            r = mid

    if array[l][pos] > value:
        l -= 1

    return l


def upper_bound_index(value, array, pos):
    # возвращаем первый элемент, который > value
    l, r = 0, len(array)

    while (r - l > 1):
        mid = (r + l) // 2

        if array[mid][pos] <= value:
            l = mid
        else:
            r = mid

    if array[l][pos] > value:
        r -= 1

    return r


def find_centroid(coords):
    centroid_lon = 0
    centroid_lat = 0

    for lon, lat in coords[:-1]:
        centroid_lon += lon
        centroid_lat += lat

    centroid_lon /= len(coords) - 1
    centroid_lat /= len(coords) - 1

    return [centroid_lon, centroid_lat]


def get_distance(coord1, coord2):
    return distance.distance(coord1, coord2).m


def get_nearest_point_id(centriod_coords, type='short', delta=3):
    lon, lat = centriod_coords
    all_points = DrawingPoint.objects.all()
    points_array = []

    for point in all_points:
        points_array.append((point.id, point.longitude, point.latitude))

    if type == 'short':
        points_array.sort(key=lambda x: x[1])
        lb = lower_bound_index(lon, points_array, 1)
        ub = upper_bound_index(lon, points_array, 1)

        first = max(0, lb - delta - 1)
        last = min(len(points_array) - 1, ub + delta)

        nearest = points_array[first:last]
    elif type=='long':
        nearest = points_array

    result = None
    min_dist = 1e9

    for point in nearest:
        # print(point[1:])
        dist = get_distance(centriod_coords, point[1:])

        if dist < min_dist:
            min_dist = dist
            result = point[0]

    return result


def get_road_by_point_id(id):
    nearest_drawing_point = DrawingPoint.objects.get(id=id)
    road_obj = nearest_drawing_point.road.all()[0]
    return road_obj


def get_road_point(road_obj, centroid):
    first_point = road_obj.get_first_point()
    last_point = road_obj.get_last_point()

    first_point_coords = first_point.longitude, first_point.latitude
    last_point_coords = last_point.longitude, last_point.latitude

    if get_distance(centroid, first_point_coords) < get_distance(centroid, last_point_coords):
        return first_point
    else:
        return last_point


def main():
    centroid = find_centroid(coordinates)
    # start_point_id_long = get_nearest_point_id(centroid, type='long')
    start_point_id = get_nearest_point_id(centroid)

    road_obj = get_road_by_point_id(start_point_id)    
    start_point = get_road_point(road_obj, centroid)

    print(road_obj)
    print(start_point)


if __name__ == '__main__':
    main()
