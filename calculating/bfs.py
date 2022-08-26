
graph = {
  '0' : ['1','2','3'],
  '1' : ['2','4','5','6'],
  '2' : [],
  '3' : [],
  '4' : [],
  '5' : [],
  '6' : []
} #Загрузить своё

check = set()
for i in range(len(graph)):
    for n in graph[str(i)]:
        if n in check:
            graph[str(i)].remove(n)
        else:
            check.add(n)
            
intial_load = [20, 5, 10, 20, 2, 4, 2] #Базовые нагрузки
additional_load = [0, 0, 0, 0, 0, 0, 0] #Дополнительная нагрузка на каждую дорогу(в конце индекс 0 будет обрезан)
limit_load = [3, 4, 5, 6, 10] #Сюда поставить лимиты для путей

current_load = 20


visited = [] # List to keep track of visited nodes.
queue = []   # Initialize a queue
def bfs(visited, graph, node, current_load):
    global queue
    global additional_load
    additional_load[int(node)] = current_load
    visited.append(node)
    queue.append(node)
    while queue:
        s = queue.pop(0)
        #print (s, end = " ")

        if (len(graph[s]) != 1):
            all = 0

            for neighbour in graph[s]:
                all += intial_load[int(neighbour)]

            for neighbour in graph[s]:
                if neighbour not in visited:
                    #print("Сумма:"+str(all))
                    additional_load[int(neighbour)] += round(additional_load[int(s)] * (intial_load[int(neighbour)] / all), 2)
                    visited.append(neighbour)
                    queue.append(neighbour)

        else:
            for neighbour in graph[s]:
                if neighbour not in visited:
                    additional_load[int(neighbour)] += additional_load[int(s)]
                    visited.append(neighbour)
                    queue.append(neighbour)
# Driver Code
bfs(visited, graph, '0', current_load)

additional_load = additional_load[1:]
intial_load = intial_load[1:]
limit_load = limit_load[1:]

print(f"Дополнительная нагрузка на дорогу: {additional_load}",
      f"Изначальная нагрузка на дорогу: {intial_load}",
      f"Максимальная нагрузка на дорогу: {limit_load}",
      sep='\n')
