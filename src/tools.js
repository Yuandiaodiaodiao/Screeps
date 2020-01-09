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

// var roomCache = undefined
var roomCacheWithCreep = {}
var roomCacheWithCreepttl = {}


function roomc(roomName) {
    if (roomCacheWithCreep[roomName] && roomCacheWithCreepttl[roomName] && roomCacheWithCreepttl[roomName] === Game.time) {
        return roomCacheWithCreep[roomName].clone()
    }
    let cost = roomc_nocreep(roomName)
    const room = Game.rooms[roomName]
    if (!cost) {
        if (room) {
            cost = getRoomCostMatrix(room)
        }
        cost = cost || new PathFinder.CostMatrix
    }
    if (room) {
        room.find(FIND_CREEPS).forEach(creep => {
            cost.set(creep.pos.x, creep.pos.y, 0xff);
        })
        room.find(FIND_POWER_CREEPS).forEach(creep => {
            cost.set(creep.pos.x, creep.pos.y, 0xff);
        })
        roomCacheWithCreep[roomName] = cost.clone()
        roomCacheWithCreepttl[roomName] = Game.time
    }
    return cost
}

function isCenterRoom(roomName) {
    // /^([WE])[0-9]+([NS])[0-9]+$/.exec('E19N43') 获取EN
    const parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
    const x = parsed[1] % 10
    const y = parsed[2] % 10
    return x >= 4 && x <= 6 && y >= 4 && y <= 6 && (!(x == 5 && y == 5))
}

function isCenter(roomName) {
    const parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
    const x = parsed[1] % 10
    const y = parsed[2] % 10
    return x >= 4 && x <= 6 && y >= 4 && y <= 6
}

function isHighway(roomName) {
    const parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName)
    return (parsed[1] % 10 === 0) ||
        (parsed[2] % 10 === 0)
}

function isMyRoom(roomName, userName) {
    const controller = (Game.rooms[roomName] || {}).controller
    return controller &&
        (controller.my || (controller.reservation && controller.reservation.username === userName))

}

function roomc_nocreep(roomName) {
    const observer = require('observer')
    const room = Game.rooms[roomName]
    if (!room && Game.memory.observerCache[roomName] && Game.memory.observerCache[roomName].owner) {
        return false
    } else if (!Game.memory.observerCache[roomName]) {
        observer.observer_queue.add(roomName)
        Game.memory.roomCacheUse[roomName] = Game.time
        return false
    } else if (!Game.memory.observerCache[roomName].time) {
        observer.observer_queue.add(roomName)
        Game.memory.roomCacheUse[roomName] = Game.time
        return false
    } else if (Game.memory.roomCacheUse[roomName] && Game.time - Game.memory.roomCacheUse[roomName] > 500) {
        Game.memory.roomCacheUse[roomName] = Game.time
        return false
    }
    let costs = undefined
    const ttl = Game.memory.roomCachettl[roomName]
    if (ttl && Game.time - ttl < 500) {
        costs = Game.memory.roomCache[roomName]
        Game.memory.roomCacheUse[roomName] = Game.time
    } else if (room) {
        costs = getRoomCostMatrix(room)
        Game.memory.roomCache[roomName] = costs
        Game.memory.roomCachettl[roomName] = Game.time
        Game.memory.roomCacheUse[roomName] = Game.time
    } else {
        observer.observer_queue.add(roomName)
        Game.memory.roomCacheUse[roomName] = Game.time
        return false
    }
    return costs ? costs.clone() : undefined
}

function getRoomCostMatrix(room) {
    const roomName = room.name
    let costs = new PathFinder.CostMatrix
    let cantgo = 0
    room.find(FIND_STRUCTURES).forEach(struct => {
            if (struct.structureType === STRUCTURE_ROAD) {
                cantgo++
                costs.set(struct.pos.x, struct.pos.y, 1)
            } else if (struct.structureType !== STRUCTURE_CONTAINER && struct.structureType !== STRUCTURE_CONTROLLER && struct.structureType !== STRUCTURE_EXTRACTOR
                && (struct.structureType === STRUCTURE_RAMPART ? (!(struct.my || struct.isPublic)) : true)) {
                cantgo++
                costs.set(struct.pos.x, struct.pos.y, 0xff)
            }
        }
    )
    room.find(FIND_MY_CONSTRUCTION_SITES).forEach(struct => {
            if (struct.structureType === STRUCTURE_ROAD) {
                cantgo++
                costs.set(struct.pos.x, struct.pos.y, 1)
            } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                (struct.structureType !== STRUCTURE_RAMPART ||
                    !struct.my)) {
                cantgo++
                costs.set(struct.pos.x, struct.pos.y, 0xff)
            }
        }
    )

    if (isCenterRoom(roomName)) {
        room.find(FIND_HOSTILE_CREEPS).forEach(o => {
            if (o.owner === 'Source Keeper') {
                for (let a = -3; a <= 3; ++a) {
                    for (let b = -3; b <= 3; ++b) {
                        costs.set(o.pos.x + a, o.pos.y + b, 0x0F)
                    }
                }
            }
        })
    }
    if (cantgo === 0) {
        costs = undefined
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
                if (a === b && b === 0) continue
                let newpos = new RoomPosition(pos.x + a, pos.y + b, pos.roomName)
                if (walkable(newpos)) {
                    return newpos
                }
            }
        }
    }
}
function allnearavailable(pos) {
    let ans=[]
    if (Game.rooms[pos.roomName]) {
        for (let a = -1; a <= 1; ++a) {
            for (let b = -1; b <= 1; ++b) {
                if (a === b && b === 0) continue
                let newpos = new RoomPosition(pos.x + a, pos.y + b, pos.roomName)
                if (walkable(newpos)) {
                    ans.push( newpos)
                }
            }
        }
    }
    return ans
}
function walkable(pos) {
    return pos.lookFor(LOOK_STRUCTURES).every(struct => {
        return !(struct.structureType !== STRUCTURE_CONTAINER && struct.structureType !== STRUCTURE_ROAD &&
            (struct.structureType !== STRUCTURE_RAMPART ||
                !struct.my))

    }) && pos.lookFor(LOOK_TERRAIN).every(o => o !== 'wall')
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
            if(options.massPart){
                let numbody={}
                for(let part in body){
                    numbody[part]=Math.ceil(body[part])
                }
                while (_.sum(numbody)<=0){
                    for(let part in numbody){
                        if(numbody[part]>0){
                            bodyarray.push(part)
                            numbody[part]-=1
                        }
                    }
                }
            }else{
                for (let part in body) {
                    for (let i of range(0, Math.ceil(body[part]))) {
                        bodyarray.push(part)
                    }
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

function suicide(creep, target) {
    if (!target) target = creep.room.storage
    if (_.sum(creep.carry) > 0 && target) {
        for (let type in creep.carry) {
            creep.transfer(target, type)
        }
        if (!creep.pos.isNearTo(target)) {
            creep.moveTo(target)
        }
    } else if (creep.ticksToLive < 500) {
        creep.suicide()
    } else if (target = creep.room.spawns[0].pos.findClosestByRange(FIND_STRUCTURES, {filter: o => o.structureType == STRUCTURE_CONTAINER})) {
        creep.moveTo(target)
        if (creep.pos.isEqualTo(target)) {
            creep.suicide()
        }
    } else {
        creep.suicide()
    }
}

// function roomCacheSet(val) {
//     if (val) {
//         roomCache = val
//         module.exports.roomCache = roomCache
//     } else {
//         return roomCache
//     }
// }

// function roomCachettlSet(val) {
//     if (val) {
//         Game.memory.roomCachettl = val
//         module.exports.roomCachettl = roomCachettl
//     } else {
//         return roomCachettl
//     }
// }


function moveByLongPath(pathArray, creep) {
    let pos = new RoomPosition(...pathArray[creep.memory.step])
    if (creep.pos.isEqualTo(pos)) {
        creep.memory.step++
        pos = new RoomPosition(...pathArray[creep.memory.step])
    }
    if (creep.pos.isNearTo(pos)) {
        creep.memory.step++
        creep.move(creep.pos.getDirectionTo(pos))
    } else {
        creep.moveTo(pos, {plainCost: 1, swampCost: 5, reusePath: 20})
    }
    if (creep.memory.step >= pathArray.length - 1) {
        delete creep.memory.step
        return OK
    }
    return ERR_NOT_IN_RANGE
}

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

function give(targetRoomName, type, number = 4000) {
    Object.values(Game.rooms).forEach(o => {
        try {
            if (type === RESOURCE_ENERGY && o.storage.store[type] < 1000e3) {
                return
            }
            let act = o.terminal.send(type, number, targetRoomName)
            if (act === OK) {
                console.log(`${o.name} send ${targetRoomName} ${number}${type}`)
            }
        } catch (e) {
        }
    })
}

function removeSubRoom(targetRoom) {
    for (let roomName in Memory.rooms) {
        let subroom = Memory.rooms[roomName].subroom
        if (subroom && subroom.indexOf(targetRoom) !== -1) {
            subroom.splice(subroom.indexOf(targetRoom), 1)
        }
    }
}

function addSubRoom(fromRoom, targetRoom) {
    let subroom = Memory.rooms[fromRoom].subroom
    if (!subroom) {
        Memory.rooms[fromRoom].subroom = []
    }
    if (subroom && subroom.indexOf(targetRoom) === -1) {
        subroom.push(targetRoom)
    }
}

module.exports = {
    'removeSubRoom': removeSubRoom,
    'addSubRoom': addSubRoom,
    'give': give,
    'bodycost': bodycost,
    'findrooms': findrooms,
    'generatebody': generatebody,
    'deepcopy': deepcopy,
    'randomNum': randomNum,
    'findroomselse': findroomselse,
    // 'roomCache': roomCache,
    // 'roomCachettl': roomCachettl,
    'roomc': roomc,
    'roomc_nocreep': roomc_nocreep,
    'testmemory': testmemory,
    'solveExtension': solveExtension,
    'nearavailable': nearavailable,
    'extensionList': extensionList,
    'suicide': suicide,
    // 'roomCacheSet': roomCacheSet,
    // 'roomCachettlSet': roomCachettlSet,
    'isCenterRoom': isCenterRoom,
    // 'roomCacheUseSet': roomCacheUseSet,
    'moveByLongPath': moveByLongPath,
    'getRoomCostMatrix': getRoomCostMatrix,
    'zipCostMatrix': zipCostMatrix,
    'unzipCostMatrix': unzipCostMatrix,
    'isHighway': isHighway,
    'allnearavailable':allnearavailable
};
