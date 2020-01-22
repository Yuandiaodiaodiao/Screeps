function work(creep) {
    const memory = creep.memory
    if (memory.status === 'getting') {
        const target = Game.getObjectById(memory.missionid)
        if (target) {
            if (creep.pos.getRangeTo(target) > 2) {
                creep.moveTo(target, {reusePath: 50})
                const tomb = creep.pos.lookFor(LOOK_TOMBSTONES)[0]
                if (tomb) {
                    creep.withdraw(tomb, memory.type)
                }
            } else if (creep.pos.getRangeTo(target) === 2) {
                creep.moveTo(target, {reusePath: 5, ignoreCreeps: false})

            } else if (target.store[memory.type] >= creep.carryCapacity - (_.sum(creep.carry) || 0)) {

                const action = creep.withdraw(target, memory.type)
                if (action == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target)
                } else if (action == OK || action == ERR_FULL) {
                    memory.status = 'carrying'
                    try {
                        if ((Memory.rooms[creep.name.split('_')[0]].missions[creep.name.split('_')[1]][memory.missionid].carrycost || 0) > creep.ticksToLive) {
                            creep.withdraw(target, memory.type, 1)
                            creep.suicide()
                        }
                    } catch (e) {
                        console.log(`carryer suicide error ${e}`)
                    }

                }
            } else if (memory.type !== RESOURCE_ENERGY && target.store[RESOURCE_ENERGY] > 0) {
                const action = creep.withdraw(target, RESOURCE_ENERGY)
                if (action === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target)
                }
            } else if (memory.type == RESOURCE_ENERGY && target.store.getUsedCapacity() > target.store.getUsedCapacity('energy')) {
                creep.memory.status = 'clean'
            }
        }
    } else if (memory.status == 'carrying') {
        const target = Game.getObjectById(memory.fill)
        if (target.structureType == STRUCTURE_STORAGE && _.sum(target.store) / target.store.getCapacity() > 0.95) return
        if (target) {
            if (creep.pos.getRangeTo(target) > 6) {
                creep.moveTo(target, {reusePath: 50})
                let road = creep.pos.lookFor(LOOK_STRUCTURES)[0]
                if (road && road.hits < road.hitsMax) {
                    creep.repair(road)
                }
            } else {
                if (target.structureType == STRUCTURE_LINK && target.energy >= 800) return
                if (memory.type != RESOURCE_ENERGY && creep.carry.energy > 0) {
                    const act = creep.transfer(target, RESOURCE_ENERGY)
                    if (act == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target)
                    }
                    return
                }
                const act = creep.transfer(target, memory.type)
                if (act == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target)
                } else if (act == OK) {
                    if (target.structureType == STRUCTURE_LINK && target.energyCapacity - target.energy >= creep.carry[memory.type]
                        || (target.store.getFreeCapacity('memory.type') >= creep.carry[memory.type])) {
                        memory.status = 'getting'
                        try {
                            if ((Memory.rooms[creep.name.split('_')[0]].missions[creep.name.split('_')[1]][memory.missionid].carrycost || 0) * 2 > creep.ticksToLive) {
                                memory.status = 'suicide'
                            }
                        } catch (e) {
                            console.log('carryer suicide error' + e)
                        }

                    }
                }
            }
        }
    } else if (memory.status == 'suicide') {
        try {
            require('tools').suicide(creep)
        } catch (e) {
            console.log(`suicide error ${creep.name}`)
        }
    } else if (memory.status === 'clean') {
        const target = Game.getObjectById(memory.missionid)
        let ok = false
        for (let type in target.store) {
            if (type !== RESOURCE_ENERGY) {
                creep.withdraw(target, type)
                ok = true
                break
            }
        }
        if (!ok) {
            for (let type in creep.store) {
                if (type !== RESOURCE_ENERGY) {
                    creep.drop(type)
                    ok = true
                    break
                }
            }
        }
        if (!ok) {
            creep.memory.status = 'getting'
        }

    }
}


function born(spawnnow, creepname, memory) {

    let body = {

        'carry': 16,
        'move': 9,
        'work': memory.type == RESOURCE_ENERGY ? 1 : 0,
    }
    let spawnnum = spawnnow.room.spawns.length
    if (memory.carrycost && spawnnum <= 2) {
        body = {

            'carry': Math.max(16, 0.55 * memory.carrycost),
            'move': (1 + Math.max(16, 0.55 * memory.carrycost) + 0.5) / 2,
            'work': memory.type == RESOURCE_ENERGY ? 1 : 0,
        }
    } else if (spawnnum >= 3) {
        body = {
            'carry': 32 + (memory.type == RESOURCE_ENERGY ? 0 : 1),
            'move': 17,
            'work': memory.type == RESOURCE_ENERGY ? 1 : 0,
        }
    }
    if (memory.type != RESOURCE_ENERGY) {
        body = {
            'carry': 16,
            'move': 8
        }
    }
    if(!Game.getObjectById(memory.gettarget)){
        return -12
    }
    if (spawnnow.pos.roomName === Game.getObjectById(memory.gettarget).pos.roomName) {
        if (body['work']) {
            delete body['work']
        }
    }
    let bodyarray = require('tools').generatebody(body, spawnnow)
    return spawnnow.spawnCreep(
        bodyarray,
        creepname,
        {
            memory: {
                status: 'getting',
                missionid: memory.gettarget,
                fill: memory.fill,
                type: memory.type
            }
        }
    )
}

module.exports = {
    'work': work,
    'born': born
};