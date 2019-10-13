function work(creep) {
    //build
    if (creep.carry.energy === 0) {
        creep.memory.status = 'getting'
    }
    if (creep.memory.status === 'repair') {
        let target = Game.getObjectById(creep.memory.repairtarget)
        if (target) {
            const act = creep.repair(target)
            if (act === ERR_NOT_IN_RANGE) {
                if (!creep.memory.repairPos) {
                    const ans = PathFinder.search(Game.rooms[creep.memory.missionid].storage.pos, {
                        pos: target.pos,
                        range: 3
                    }, {
                        plainCost: 2,
                        swampCost: 10,
                        roomCallback: require('tools').roomc_nocreep,
                    })
                    const targetPos = _.last(ans.path)
                    creep.memory.repairPos = [targetPos.x, targetPos.y, targetPos.roomName]
                }
                let repairPos = new RoomPosition(...creep.memory.repairPos)
                if (repairPos.lookFor(LOOK_CREEPS).length > 0) {
                    const ans = PathFinder.search(Game.rooms[creep.memory.missionid].storage.pos, {
                        pos: target.pos,
                        range: 3
                    }, {
                        plainCost: 2,
                        swampCost: 10,
                        roomCallback: require('tools').roomc,
                    })
                    const targetPos = _.last(ans.path)
                    creep.memory.repairPos = [targetPos.x, targetPos.y, targetPos.roomName]
                    repairPos = new RoomPosition(...creep.memory.repairPos)
                }
                creep.moveTo(repairPos)
            } else if (act === ERR_NOT_ENOUGH_RESOURCES || creep.carry.energy === 0) {
                creep.memory.status = 'getting'
            }
        }
    }
    if (creep.memory.status === 'getting') {
        const act = creep.withdraw(Game.rooms[creep.memory.missionid].storage, RESOURCE_ENERGY)
        if (act === ERR_NOT_IN_RANGE) {
            creep.moveTo(Game.rooms[creep.memory.missionid].storage)
        } else {
            creep.memory.status = 'repair'
        }
    }

}


function born(spawnnow, creepname, memory) {
    let targets = spawnnow.room.find(FIND_STRUCTURES, {
        filter: struct => {
            return struct.structureType === STRUCTURE_RAMPART || struct.structureType === STRUCTURE_WALL
        }
    })
    let target = require('lodash-my').minBy(targets, struct => struct.hits)
    const ans = PathFinder.search(spawnnow.room.storage.pos, {pos: target.pos, range: 3}, {
        plainCost: 2,
        swampCost: 10,
        roomCallback: require('tools').roomc_nocreep,
    })
    const dist = ans.cost
    let bestF = 0
    let bestCarry = 1
    for (let i = 1; i <= 32; ++i) {
        let y = i * 100 / (i * 50 / (33 - i) + dist * 2)
        if (y > bestF) {
            bestF = y
            bestCarry = i
        }
    }
    let workNum = 33 - bestCarry
    let body = {
        'work': workNum,
        'carry': bestCarry,
        'move': 17
    }
    const targetPos = _.last(ans.path)
    let bodyarray = require('tools').generatebody(body, spawnnow)
    return spawnnow.spawnCreep(
        bodyarray,
        creepname,
        {
            memory: {
                status: 'getting',
                missionid: memory.roomName,
                repairtarget: target.id,
                repairPos: [targetPos.x, targetPos.y, targetPos.roomName]
            }
        }
    )
}

function miss(room) {
    room.memory.missions.wallWorker = {}
    if (room.controller.level === 8 && room.storage && room.storage.store[RESOURCE_ENERGY] / room.storage.storeCapacity > 0.7) {
        room.memory.missions.wallWorker[room.name] = {
            roomName: room.name,
            numfix: Math.min(3, Math.ceil((room.storage.store[RESOURCE_ENERGY] / room.storage.storeCapacity - 0.7) / 0.1))
        }
    } else {
        room.memory.missions.wallWorker = undefined
    }
}

module.exports = {
    'work': work,
    'born': born,
    'miss': miss,
};