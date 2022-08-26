
# graph = {
#   '0' : ['1','2','3'],
#   '1' : ['2','4','5','6'],
#   '2' : [],
#   '3' : [],
#   '4' : [],
#   '5' : [],
#   '6' : []
# } #Загрузить своё

def bfs(node, graph, current_load, initial_load, limit_load):
    queue=[node]
    visited = []

    additional_load = [0 for _ in range(len(initial_load) + 1)]
    additional_load[node] = current_load
    visited.append(node)
    # queue.append(node)
    while queue:
        s = queue.pop(0)
        #print (s, end = " ")

        if (len(graph[s]) != 1):
            all = 0

            for neighbour in graph[s]:
                all += initial_load[int(neighbour)]

            for neighbour in graph[s]:
                if neighbour not in visited:
                    #print("Сумма:"+str(all))
                    print(s)
                    additional_load[int(neighbour)] += round(additional_load[int(s)] * (initial_load[int(neighbour)] / all), 2)
                    visited.append(neighbour)
                    queue.append(neighbour)

        else:
            for neighbour in graph[s]:
                if neighbour not in visited:
                    print(neighbour)
                    additional_load[int(neighbour)] += additional_load[int(s)]
                    visited.append(neighbour)
                    queue.append(neighbour)

    return additional_load

def bfs_total(graph, addition, initial_load, limit_load):
    check = set()
    for i in graph.keys():
        for n in graph[i]:
            if n in check:
                graph[i].remove(n)
            else:
                check.add(n)
                
    # intial_load = [20, 5, 10, 20, 2, 4, 2] #Базовые нагрузки
    # additional_load = additional_load = [0 for _ in range(len(initial_load))] #Дополнительная нагрузка на каждую дорогу(в конце индекс 0 будет обрезан)
    # limit_load = [3, 4, 5, 6, 10] #Сюда поставить лимиты для путей

    return bfs(0, graph, addition, initial_load, limit_load)
    # visited = [] # List to keep track of visited nodes.
    # queue = []   # Initialize a queue


# Driver Code
# bfs(visited, graph, '0', current_load)


