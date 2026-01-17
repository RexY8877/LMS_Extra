
data = []
try:
    for i in range(10000000):
        data.append([0] * 10000)
except MemoryError:
    print("MemoryError caught")
