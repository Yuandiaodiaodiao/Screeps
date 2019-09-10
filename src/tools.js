function* range(beg, end, step = 1) {
    for (let i = beg; i < end; i += step)
        yield i;
}

function findroomselse(room, findconst, filters) {
    let roomset = new Set(Memory.rooms[room.name].subroom)
    let ans = []
    for (let name in Game.rooms) {
        if (roomset.has(name)) {
            ans = ans.concat(Game.rooms[name].find(findconst, filters))
        }
    }
    return ans
}


function findrooms(room, findconst, filters) {
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
        let maxenergy = Math.max(spawnnow.room.energyCapacityAvailable - 100, 300)
        while (bodycost(body) > maxenergy) {
            let maxbody = -1
            for (let part in body) {
                body[part] /= 1.2
                maxbody = Math.max(Math.ceil(body[part]), maxbody)
            }
            if (maxbody == 1) break
        }
    }
    return body
    // let bodyarray = []
    // for (let part in body) {
    //     for (let i of range(0, Math.ceil(body[part]))) {
    //         bodyarray.push(part)
    //     }
    // }
    // return bodyarray
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

var extensionList = {}

function solveExtension(room) {
    try {
        let tar = room.storage || _.head(room.spawns) || undefined
        if (!tar) return extensionList[room.name] = []
        let t1 = Game.cpu.getUsed()
        const maxnum = Math.floor((Math.min(33, Math.floor((room.energyCapacityAvailable - room.spawns.length * 300) / 150 * 2)) * 50) / EXTENSION_ENERGY_CAPACITY[room.controller.level])
        // console.log('maxnum=' + maxnum + 'room=' + room.name)
        let nownum = maxnum
        let pos = nearavailable(tar.pos)
        let used = new Set()
        let position = []
        let idlist = []
        let target = null
        let n = 1
        while (target = pos.findClosestByPath(FIND_STRUCTURES, {filter: obj => obj.structureType == STRUCTURE_EXTENSION && !used.has(obj.id)})) {
            if (!pos.isNearTo(target)) {
                let ans = PathFinder.search(pos, {pos: target.pos, range: 1}, {
                    plainCost: 0xff,
                    swampCost: 0xff,
                    roomCallback: require('tools').roomc_nocreep,
                })
                // for (let x of ans.path) {
                //     if (position.length == 0 || !_.last(position).isEqualTo(x)) {
                //         position.push(x)
                //     }
                // }
                pos = _.last(ans.path)
            }
            idlist.push(target.id)
            used.add(target.id)
            --nownum
            if (nownum == 0) {
                nownum = maxnum
                pos = nearavailable(tar.pos)
            }
        }
        return extensionList[room.name] = idlist
    } catch (e) {
        console.log('solveExtension error' + e)
    }

    // t1=Game.cpu.getUsed()
    // target = pos.findClosestByPath(FIND_STRUCTURES, {filter: obj => obj.structureType == STRUCTURE_EXTENSION })
    // let t2=Game.cpu.getUsed()
    // console.log(room.name+'solveExtension used='+(t2-t1))
}

function nearavailable(pos) {
    if (Game.rooms[pos.roomName]) {
        for (let a = -1; a <= 1; ++a) {
            for (let b = -1; b <= 1; ++b) {
                if (a == b && b == 0) continue
                let newpos = new RoomPosition(pos.x + a, pos.y + b, pos.roomName)
                if (walkable(newpos)) {
                    return newpos
                }
            }
        }
    }
}

function walkable(pos) {
    return pos.lookFor(LOOK_STRUCTURES).every(struct => {
        if (struct.structureType !== STRUCTURE_CONTAINER && struct.structureType != STRUCTURE_ROAD &&
            (struct.structureType !== STRUCTURE_RAMPART ||
                !struct.my)) {
            return false
        }
        return true
    })
}

if (!StructureSpawn.prototype._spawnCreep) {
    StructureSpawn.prototype._spawnCreep = StructureSpawn.prototype.spawnCreep
    StructureSpawn.prototype.spawnCreep = function (body, name, options = {}) {
        let bodycosts = 9999
        if (_.isArray(body)) {
            bodycosts = 0
            for (let part of body) {
                bodycosts += BODYPART_COST[part]
            }
            if (bodycosts > this.room.energyAvailable) return ERR_NOT_ENOUGH_ENERGY
        } else if (_.isPlainObject(body)) {
            bodycosts = bodycost(body)
            if (bodycosts > this.room.energyAvailable) return ERR_NOT_ENOUGH_ENERGY
            let bodyarray = []
            for (let part in body) {
                for (let i of range(0, Math.ceil(body[part]))) {
                    bodyarray.push(part)
                }
            }
            body = bodyarray
        }
        if (!extensionList[this.room.name]) {
            solveExtension(this.room)
        }
        if (!options.energyStructures && extensionList[this.room.name]) {
            let es = []
            extensionList[this.room.name].forEach(o => {
                if (bodycosts > 0) {
                    let ext = Game.getObjectById(o)
                    bodycosts -= ext.energy
                    es.push(ext)
                }
            })
            this.room.spawns.forEach(o => es.push(o))
            options.energyStructures = es
        }
        return this._spawnCreep(body, name, options)
    }
}

function suicide(creep) {
    let target=null
    if (_.sum(creep.carry) > 0 &&( target=creep.room.storage)) {
        for (let type of creep.carry) {
            creep.transfer(target, type)
        }
        if (!creep.pos.isNearTo(target)) {
            creep.moveTo(target)
        }
    }else if(target=room.containers[0]){
        creep.moveTo(target)
        if(creep.pos.isEqualTo(target)){
            creep.suicide()
        }
    }else{
        creep.suicide()
    }
}

module.exports = {
    'findrooms': findrooms,
    'generatebody': generatebody,
    'deepcopy': deepcopy,
    'randomNum': randomNum,
    'findroomselse': findroomselse,
    'roomCache': roomCache,
    'roomCachettl': roomCachettl,
    'roomc': roomc,
    'roomc_nocreep': roomc_nocreep,
    'testmemory': testmemory,
    'solveExtension': solveExtension,
    'nearavailable': nearavailable,
    'extensionList': extensionList,
    'suicide': suicide
};
