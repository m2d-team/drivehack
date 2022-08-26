def metro_people(distance , people):
    if (distance > 1000):
        return 0
    elif ( 500 <= distance and distance <= 1000):
        return people * 0.5
    else:
        return people * 0.8