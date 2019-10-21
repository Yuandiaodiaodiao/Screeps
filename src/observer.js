var observer_queue = new Set()
var observerCache = undefined

function work() {
    if (!observerCache) observerCache = {}
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
                if (act == OK) {
                    flag = true
                    used.add(obs.id)
                    break
                }
            }
            if (flag == false) {
                if (observers.every(o => Game.map.getRoomLinearDistance(o.pos.roomName, roomName) > 10)) {
                    observer_queue.delete(roomName)
                    observerCache[roomName] = {lazytime: Game.time}
                }
            }
            if (used.size == Memory.observer.length) break
        } else {
            //可见
            observer_queue.delete(roomName)
            observerCache[roomName] = {}
            const controller = room.controller
            const spawn = room.spawns.length
            if (controller && controller.owner && controller.level > 2 && !controller.my && spawn !== 0) {
                observerCache[roomName] = {
                    owner: controller.owner.username,
                    time: Game.time
                }
            } else if (controller && controller.reservation && !(controller.reservation.username === 'Invader' || controller.reservation.username === 'Yuandiaodiaodiao')) {
                observerCache[roomName] = {
                    owner: controller.reservation.username,
                    time: Game.time
                }
            } else if (!controller) {
                const pb = room.powerBanks[0]
                // const newWall = room.find(FIND_STRUCTURES, {filter: o => o.structureType === STRUCTURE_WALL && (!o.hits)})[0]
                if (pb) {
                    observerCache[roomName] = {
                        powerBank: true,
                        power: pb.power,
                        startTime: Game.time - (5000 - pb.ticksToDecay),
                        time: Game.time,
                        pos: [pb.pos.x, pb.pos.y]
                    }
                } else {
                    observerCache[roomName] = {
                        time: Game.time
                    }
                }
            } else {
                observerCache[roomName] = {
                    time: Game.time
                }
            }


            const ttl = Game.tools.roomCachettl[roomName]
            if (!ttl || Game.time - ttl >= 500) {
                const costs = Game.tools.getRoomCostMatrix(room)
                Game.tools.roomCache[roomName] = costs
                Game.tools.roomCachettl[roomName] = Game.time
            }
            if (Game.tools.roomCacheUse[roomName] && Game.time - Game.tools.roomCacheUse[roomName] > 4000) {
                //clear costMatrix to save memory
                Game.tools.roomCache[roomName] = undefined
                observerCache[roomName]['lazytime'] = Game.time
                observerCache[roomName]['time'] = undefined
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
        if (observerCache[roomName].time && Game.time - observerCache[roomName].time > 1000) {
            observer_queue.add(roomName)
        } else if (observerCache[roomName].lazytime && Game.time - observerCache[roomName].lazytime > 3000) {
            observer_queue.add(roomName)
        }
    }
    for (let roomName in require('tools').roomCache) {
        if (!require('tools').roomCacheUse[roomName]) {
            require('tools').roomCacheUse[roomName] = Game.time
        } else if (Game.time - require('tools').roomCacheUse[roomName] > 8000) {
            delete observerCache[roomName]
        } else if (Game.time - require('tools').roomCacheUse[roomName] > 4000) {
            require('tools').roomCache[roomName] = undefined
            observerCache[roomName] = observerCache[roomName] || {}
            observerCache[roomName]['lazytime'] = Game.time
            observerCache[roomName]['time'] = undefined
        }
    }
}

function observerCacheSet(val) {
    if (val) {
        observerCache = val
        module.exports.observerCache = observerCache||{}
    } else {
        return observerCache
    }
}


module.exports = {
    'work': work,
    'find': find,
    'cache': cache,
    'observerCache': observerCache,
    'observer_queue': observer_queue,
    'observerCacheSet': observerCacheSet
};