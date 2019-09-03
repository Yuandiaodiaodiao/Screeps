
function* range(beg, end, step = 1) {
    for (let i = beg; i < end; i += step)
        yield i;
}

function findroomselse(room, findconst) {
    let roomset = new Set(Memory.rooms[room.name].subroom)
    let ans = []
    for (let name in Game.rooms) {
        if (roomset.has(name)) {
            ans = ans.concat(Game.rooms[name].find(findconst))
        }
    }
    return ans
}

function findroomselsefilter(room, findconst, filters) {
    let roomset = new Set(Memory.rooms[room.name].subroom)
    let ans = []
    for (let name in Game.rooms) {
        if (roomset.has(name)) {
            ans = ans.concat(Game.rooms[name].find(findconst, filters))
        }
    }
    return ans
}

function findrooms(room, findconst) {
    let roomset = new Set(Memory.rooms[room.name].subroom)
    roomset.add(room.name)
    let ans = []
    for (let name in Game.rooms) {
        if (roomset.has(name)) {
            ans = ans.concat(Game.rooms[name].find(findconst))
        }
    }
    return ans
}

function findroomsfilter(room, findconst, filters) {
    let roomset = new Set(Memory.rooms[room.name].subroom)
    roomset.add(room.name)
    let ans = []
    for (let name in Game.rooms) {
        if (roomset.has(name)) {
            ans = ans.concat(Game.rooms[name].find(findconst, filters))
        }
    }
    return ans
}

function bodycost(body) {
    let nowcost = 0
    for (let part in body) {
        nowcost += Math.ceil(body[part]) * BODYPART_COST[part]
    }
    return nowcost
}

function generatebody(body, spawnnow = null) {
    let maxpart = 0
    for (let part in body) {
        maxpart += Math.ceil(body[part])
    }
    while (maxpart > 50) {
        let fix = 49.9 / maxpart
        maxpart = 0
        for (let part in body) {
            body[part] *= fix
            maxpart += Math.ceil(body[part])
        }
    }
    if (spawnnow) {
        let maxenergy = spawnnow.room.energyCapacityAvailable-50
        while (bodycost(body) > maxenergy) {
            let maxbody = -1
            for (let part in body) {
                body[part] /= 1.2
                maxbody = Math.max(Math.ceil(body[part]), maxbody)
            }
            if (maxbody == 1) break
        }
    }
    let bodyarray = []
    for (let part in body) {
        for (let i of range(0, Math.ceil(body[part]))) {
            bodyarray.push(part)
        }
    }
    return bodyarray
}

function deepcopy(obj) {
    let _obj = JSON.stringify(obj),
        objClone = JSON.parse(_obj);
    return objClone
}

function randomNum(minNum, maxNum) {
    switch (arguments.length) {
        case 1:
            return parseInt(Math.random() * minNum + 1, 10);
            break;
        case 2:
            return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
            break;
        default:
            return 0;
            break;
    }
}

var roomCache = {}
var roomCacheWithCreep = {}
var roomCacheWithCreepttl = {}
var roomCachettl = {}

function roomc(roomName) {
    const observer = require('observer')
    if (observer.observerCache[roomName] && observer.observerCache[roomName].owner) {
        return false
    } else if (!observer.observerCache[roomName]) {
        observer.observer_queue.add(roomName)
    }
    let room = Game.rooms[roomName];
    let costs = null
    const roomC = roomCache[roomName]
    const ttl = roomCachettl[roomName]
    if (roomC && ttl && Game.time - ttl < 1500) {
        costs = roomC
    } else {
        //refreash cache
        costs = new PathFinder.CostMatrix
        if (room) {
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
        }
        roomCache[roomName] = costs
        roomCachettl[roomName] = Game.time
    }
    if (!room) {
        return costs
    }
    if (roomCacheWithCreep[roomName] && roomCacheWithCreepttl[roomName] && roomCacheWithCreepttl[roomName] == Game.time) {
        return roomCacheWithCreep[roomName]
    } else {
        const copy = costs.clone()
        room.find(FIND_CREEPS).forEach(function (creep) {
            copy.set(creep.pos.x, creep.pos.y, 0xff);
        })
        room.find(FIND_POWER_CREEPS).forEach(function (creep) {
            copy.set(creep.pos.x, creep.pos.y, 0xff);
        })
        roomCacheWithCreep[roomName] = copy
        roomCacheWithCreepttl[roomName] = Game.time
        return copy
    }


}

function roomc_nocreep(roomName) {
    const observer = require('observer')
    if (observer.observerCache[roomName] && observer.observerCache[roomName].owner) {
        return false
    } else if (!observer.observerCache[roomName]) {
        observer.observer_queue.add(roomName)
    }
    let room = Game.rooms[roomName];
    let costs = null
    const roomC = roomCache[roomName]
    const ttl = roomCachettl[roomName]
    if (roomC && ttl && Game.time - ttl < 1500) {
        costs = roomC
    } else {
        //refreash cache
        costs = new PathFinder.CostMatrix
        if (room) {
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
        }
        roomCache[roomName] = costs
        roomCachettl[roomName] = Game.time
    }
    return costs
}

function testmemory() {
    let t1 = Game.cpu.getUsed()
    let memory = JSON.parse(RawMemory.get())
    let t2 = Game.cpu.getUsed()
// ...your script
    let memorys = JSON.stringify(Memory)
    let t3 = Game.cpu.getUsed()
    console.log('memory prase=' + (t2 - t1).toFixed(4) + ' stringify=' + (t3 - t2).toFixed(4))
}

module.exports = {
    'findrooms': findrooms,
    'generatebody': generatebody,
    'deepcopy': deepcopy,
    'findroomsfilter': findroomsfilter,
    'randomNum': randomNum,
    'findroomselse': findroomselse,
    'findroomselsefilter': findroomselsefilter,
    'roomCache': roomCache,
    'roomCachettl':roomCachettl,
    'roomc': roomc,
    'roomc_nocreep': roomc_nocreep,
    'testmemory': testmemory,
};
