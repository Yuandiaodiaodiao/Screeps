var observer_queue = new Set()

// var observerCache = undefined

function work() {
    if (!Game.memory.observerCache) Game.memory.observerCache = {}
    if (!observer_queue) observer_queue = new Set()
    let used = new Set()
    if (observer_queue.size == 0) return
    let observers = []
    Memory.observer.forEach(o => observers.push(Game.getObjectById(o)))
    for (let roomName of observer_queue) {
        const room = Game.rooms[roomName]
        if (!room) {
            //不可见
            let flag = false
            for (let obs of observers) {
                if (used.has(obs.id)) continue
                const act = obs.observeRoom(roomName)
                if (act === OK) {
                    flag = true
                    used.add(obs.id)
                    break
                }
            }
            if (flag === false) {
                if (observers.every(o => Game.map.getRoomLinearDistance(o.pos.roomName, roomName) > 10)) {
                    observer_queue.delete(roomName)
                    delete Game.memory.observerCache[roomName]
                    delete Game.memory.roomCache[roomName]
                    delete Game.memory.roomCacheUse[roomName]
                    delete Game.memory.roomCachettl[roomName]
                }
            }
            if (used.size === Memory.observer.length) break
        } else {
            //可见
            observer_queue.delete(roomName)
            Game.memory.observerCache[roomName] = {}
            const controller = room.controller
            const spawn = room.spawns.length
            Game.memory.observerCache[roomName] = {
                time: Game.time
            }
            if (controller && controller.owner && controller.level > 2 && !controller.my && spawn !== 0) {
                Game.memory.observerCache[roomName].owner = controller.owner.username
            } else if (controller && controller.reservation && !(controller.reservation.username === 'Invader' || controller.reservation.username === 'Yuandiaodiaodiao')) {

            } else if (!controller && Game.tools.isHighway(roomName)) {
                const pb = room.powerBanks[0]
                // const newWall = room.find(FIND_STRUCTURES, {filter: o => o.structureType === STRUCTURE_WALL && (!o.hits)})[0]
                if (pb) {
                    Game.memory.observerCache[roomName] = {
                        powerBank: true,
                        power: pb.power,
                        pbid: pb.id,
                        startTime: Game.time - (5000 - pb.ticksToDecay),
                        time: Game.time,
                        pos: [pb.pos.x, pb.pos.y]
                    }

                }
            }
            const invaderCore = room.find(FIND_HOSTILE_STRUCTURES, {filter: o => o.structureType === STRUCTURE_INVADER_CORE && o.level > 0})[0]
            if (invaderCore) {
                Game.memory.observerCache[roomName].owner = 'Invader'
            }
            if(roomName in Game.config.obterminal){
                Game.memory.observerCache[roomName]=Game.memory.observerCache[roomName]||{}
                let store={}
                for(type in room.terminal.store){
                    if(type.length>=5){
                        store[type]=room.terminal.store[type]
                    }
                }
                let storage={}
                for(type in room.storage.store){
                    if(type.length>=5){
                        storage[type]=room.terminal.store[type]
                    }
                }
                // console.log(`obroom=${room.name}\n terlimal=${JSON.stringify(store)} \n storage=${JSON.stringify(storage)}`)
                if(Game.config.obterminal[roomName].merge){
                    for(let type in storage){
                        store[type]=(store[type]||0)+(storage[type]||0)
                    }
                }
                Game.memory.observerCache[roomName].terminalstore=store
            }

            const ttl = Game.memory.roomCachettl[roomName]
            if (!ttl || Game.time - ttl >= 500) {
                const costs = Game.tools.getRoomCostMatrix(room)
                Game.memory.roomCache[roomName] = costs
                Game.memory.roomCachettl[roomName] = Game.time
            }


        }
    }

}

function find() {
    Memory.observer = []
    for (let roomName in Memory.rooms) {
        let room = Game.rooms[roomName]
        let obs = room.observer
        if (obs) {
            Memory.observer.push(obs.id)
        }
    }
}

function cache() {
    for (let roomName in Game.memory.observerCache) {
        if (Game.memory.observerCache[roomName].time && Game.time - Game.memory.observerCache[roomName].time > 1000) {
            observer_queue.add(roomName)
        }
    }
    for (let roomName in Game.memory.roomCache) {
        if (!Game.memory.roomCacheUse[roomName]) {
            Game.memory.roomCacheUse[roomName] = Game.time
        } else if (Game.time - Game.memory.roomCacheUse[roomName] > 10000) {
            delete Game.memory.observerCache[roomName]
            delete Game.memory.roomCache[roomName]
            delete Game.memory.roomCacheUse[roomName]
            delete Game.memory.roomCachettl[roomName]
        }
    }
}

// function observerCacheSet(val) {
//     if (val) {
//         Game.memory.observerCache = val
//         module.exports.observerCache = observerCache||{}
//     } else {
//         return observerCache
//     }
// }


module.exports = {
    'work': work,
    'find': find,
    'cache': cache,
    // 'observerCache': observerCache,
    'observer_queue': observer_queue,
    // 'observerCacheSet': observerCacheSet
};