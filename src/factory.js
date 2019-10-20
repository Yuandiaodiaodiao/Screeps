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

function miss(room) {
    if (!room.memory.factory) {
        room.memory.factory = {}
    }
    const memory = room.memory.factory
    const factory = room.factory
    const terminal = room.terminal
    const mineType = room.find(FIND_MINERALS)[0].mineralType
    if (terminal.store.getUsedCapacity(mineType) > (memory.status === 'fill' ? 60e3 : 70e3) && factory.store.getUsedCapacity(mineType) < 10e3) {
        memory.status = 'fill'
        memory.fillType = mineType
        memory.thor = 10e3 - factory.store.getUsedCapacity(mineType)
    } else if (factory.store.getUsedCapacity(mineType) > 18e3) {
        memory.status = 'get'
        memory.fillType = mineType
        memory.thor = factory.store.getUsedCapacity(mineType) - 10e3
    } else if (factory.store.getUsedCapacity(produce[mineType]) > 6000) {
        memory.status = 'get'
        memory.fillType = produce[mineType]
        memory.thor = factory.store.getUsedCapacity(produce[mineType]) - 3000
    } else {
        memory.status = ''
        memory.fillType = mineType
        memory.thor = 0
    }


}

module.exports.doReact = doReact

function doReact(room) {
    const memory = room.memory.factory
    const factory = room.factory
    if (factory) {
        if (!factory.cooldown) {
            for (let type in reaction) {
                const act = factory.produce(type)
                if (act === OK) {
                    break
                }
            }
        }

    }
}

