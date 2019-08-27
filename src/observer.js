var observer_queue = new Set()
var observerCache = {}

function work() {
    if (!observerCache) observerCache = {}
    if (!observer_queue) observer_queue = new Set()
    // if (observer_queue.size > 0) console.log('observer_queue.size= ' + observer_queue.size + ' time=' + Game.time)
    let used = new Set()
    for (let roomName of observer_queue) {
        const room = Game.rooms[roomName]
        if (!room) {
            //不可见
            let flag = false
            for (let id of Memory.observer) {
                if (used.has(id)) continue
                const obs = Game.getObjectById(id)
                const act = obs.observeRoom(roomName)
                if (act == OK) {
                    flag = true
                    used.add(id)
                    // console.log(id+' observe '+roomName)
                    break
                }
            }
            if (flag == false) {
                // console.log('cant observe'+roomName)
                observer_queue.delete(roomName)
            }
            if (used.size == Memory.observer.length) break
        } else {
            //可见
            // console.log('getroom '+roomName)
            observer_queue.delete(roomName)
            observerCache[roomName] = {}
            if (room.controller && !room.controller.my) {
                const owner = room.controller.owner
                if (owner) {
                    observerCache[roomName] = {
                        owner: owner.username,
                        time: Game.time
                    }
                }
            }

            if (room.controller && room.controller.reservation && !room.controller.reservation.username == 'Yuandiaodiaodiao') {
                const reserv = room.controller.reservation.username
                if (reserv) {
                    observerCache[roomName] = {
                        owner: reserv,
                        time: Game.time
                    }
                }
            }
            if (!room.controller) {
                const pb = room.powerBanks[0]
                if (pb) {
                    observerCache[roomName] = {
                        powerBank: true,
                        power: pb.power,
                        startTime: Game.time - (5000 - pb.ticksToDecay),
                        time: Game.time,
                        pos: [pb.pos.x, pb.pos.y]
                    }
                }
            }
            if (room.controller && !room.controller.owner && !room.controller.reservation) {
                const roomC = require('tools').roomCache[roomName]
                const ttl = require('tools').roomCachettl[roomName]
                if (!roomC || !ttl || Game.time - ttl > 500) {
                    //refreash cache
                    const costs = new PathFinder.CostMatrix

                    room.find(FIND_STRUCTURES).forEach(function (struct) {
                        if (struct.structureType === STRUCTURE_ROAD) {
                            // Favor roads over plain tiles
                            costs.set(struct.pos.x, struct.pos.y, 1);
                        } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                            (struct.structureType !== STRUCTURE_RAMPART ||
                                !struct.my)) {
                            // Can't walk through non-walkable buildings
                            costs.set(struct.pos.x, struct.pos.y, 0xff);
                        }
                    })
                    require('tools').roomCache[roomName] = costs
                    require('tools').roomCachettl[roomName] = Game.time
                }
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
    for (let roomName in observerCache) {
        if (observerCache[roomName].time && Game.time - observerCache[roomName].time > 500) {
            observer_queue.add(roomName)
        }
    }
    if (Game.time % 3000 == 0) {
        for (let roomName in observerCache) {
            if (!observerCache[roomName].owner) {
                delete observerCache[roomName]
            }
        }
    }
}

function clearCache() {

}

module.exports = {
    'work': work,
    'find': find,
    'cache': cache,
    'observerCache': observerCache,
    'observer_queue': observer_queue,
    'clearCache': clearCache
};