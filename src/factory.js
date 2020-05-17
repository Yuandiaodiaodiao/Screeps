module.exports.miss = miss
if (!Memory.factory) {
    Memory.factory = {}
}
let reaction = {
    'utrium_bar': ['U', 'energy'],
    'lemergium_bar': ['L', 'energy'],
    'zynthium_bar': ['Z', 'energy'],
    'keanium_bar': ['K', 'energy'],
    'oxidant': ['O', 'energy'],
    'reductant': ['H', 'energy'],
    'purifier': ['X', 'energy'],
}
let produce = {
    'U': 'utrium_bar',
    'L': 'lemergium_bar',
    'Z': 'zynthium_bar',
    'K': 'keanium_bar',
    'O': 'oxidant',
    'H': 'reductant',
    'X': 'purifier'
}
module.exports.produce = produce

//10e3 energy 15e3~10e3 mineral  20e3 bar
function miss(room) {
    if (!room.memory.factory) {
        room.memory.factory = {}
    }
    const memory = room.memory.factory
    const factory = room.factory
    if (!factory) {
        return
    }


    const terminal = room.terminal
    const mineType = (Game.terminal.roomMineralCache[room.name] || room.find(FIND_MINERALS)[0]).mineralType
    const produceType = produce[mineType]
    factory.store[mineType] = factory.store[mineType] || 0
    factory.store[produceType] = factory.store[produceType] || 0
    terminal.store[mineType] = terminal.store[mineType] || 0
    terminal.store[produceType] = terminal.store[produceType] || 0
    if (terminal.store.getUsedCapacity(mineType) > (memory.status === 'fill' ? 40e3 : 50e3) && factory.store.getUsedCapacity(mineType) < 10e3) {
        //矿太少了 terminal里正好矿多 压缩 填进factory 并且factory里不多余
        memory.status = 'fill'
        memory.fillType = mineType
        memory.thor = 5e3
    } else if (factory.store.getUsedCapacity(mineType) > 1.6e3 && terminal.store[mineType] < 25e3) {
        //矿太多了 factory解压出去 扔terminal里
        memory.status = 'get'
        memory.fillType = mineType
        memory.thor = 2e3
    } else if (factory.store.getUsedCapacity(produceType) > 30e3) {
        //bar 太多了 卖了 吐出去
        memory.status = 'get'
        memory.fillType = produce[mineType]
        memory.thor = 3000
    } else if (factory.store.getUsedCapacity(produce[mineType]) < 20e3 && terminal.store.getUsedCapacity(produce[mineType]) > 0) {
        //bar太少了 不卖了 拉回来
        memory.status = 'fill'
        memory.fillType = produce[mineType]
        memory.thor = 5e3
    } else {
        memory.status = ''
        memory.fillType = mineType
        memory.thor = 0
    }
    if (terminal.store[mineType] < 15e3 && factory.store[mineType] < 3e3 && factory.store[produce[mineType]] > 100) {
        memory.react = 'release'
    } else if (factory.store[mineType] > 3e3 || (factory.store[mineType] > 200 && terminal.store[mineType] > 40e3)) {
        memory.react = 'zip'
    } else {
        memory.react = 'no'
    }


}

module.exports.doReact = doReact

function doReact(room) {
    const memory = room.memory.factory
    const factory = room.factory
    if (!factory) return
    if (!memory.react || memory.react === 'no') return;
    const mineType = (Game.terminal.roomMineralCache[room.name] || room.find(FIND_MINERALS)[0]).mineralType
    if (factory) {
        if (!factory.cooldown) {

            if (memory.react === 'zip') {
                let type = produce[mineType]
                const act = factory.produce(type)
                if (act === OK) {
                    console.log(`${room.name} 压缩 ${type}`)

                    miss(room)
                    return
                }
            } else if (memory.react === 'release') {
                const act = factory.produce(mineType)
                if (act === OK) {
                    console.log(`${room.name} 解压 ${mineType}`)

                    miss(room)
                    return
                }
            }
        }
    }
}

