function zipCostMatrix(cost) {
    let arr = new Uint32Array(cost._bits.buffer)
    let ans = {}
    arr.forEach((o, index) => {
        if (o > 0) ans[index] = o
    })
    return ans
}

function unzipCostMatrix(cost) {
    let arr = new Uint32Array(625)
    for (let index in cost) {
        arr[parseInt(index)] = cost[index]
    }
    let instance = Object.create(PathFinder.CostMatrix.prototype)
    instance._bits = new Uint8Array(arr.buffer)
    return instance
}