module.exports = {
    'work': work,
    'born': born
};
var tools = require('tools')

function work(creep) {
    //fill
    const memory = creep.memory
    if (creep.carry.energy == 0) {
        memory.status = 'getting'
    }
    if (memory.status == 'getting') {

        let target = Game.getObjectById(memory.missionid)

        if (target && target.store[RESOURCE_ENERGY] > 0) {
            const action = creep.withdraw(target, RESOURCE_ENERGY)
            if (action == ERR_NOT_IN_RANGE) {
                creep.moveTo(target)
            } else if (action == OK || action == ERR_FULL) {
                memory.status = 'carrying'
            }
        } else {
            try {
                target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: obj => {
                        if (obj.store) {
                            return obj.store[RESOURCE_ENERGY] > 0
                        } else {
                            return false
                        }
                    }
                })
                if (!target) return
            } catch (e) {
                console.log('errfill' + e)
            }
            let action = creep.withdraw(target, RESOURCE_ENERGY)
            if (action == ERR_NOT_IN_RANGE) {
                creep.moveTo(target)
            } else if (action == OK) {
                memory.status = 'carrying'
            }
            if (creep.carry.energy >= creep.carryCapacity) {
                memory.status = 'carrying'
            }
        }

    }
    if (memory.status == 'carrying') {
        let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                if (structure.structureType == STRUCTURE_EXTENSION) {
                    return structure.energy < structure.energyCapacity
                } else if (structure.structureType == STRUCTURE_SPAWN) {
                    return structure.energy < 250
                } else if (structure.structureType == STRUCTURE_TOWER) {
                    return structure.energy / structure.energyCapacity < 0.75
                } else if (creep.room.energyAvailable / creep.room.energyCapacityAvailable > 0.99) {
                    if (structure.structureType == STRUCTURE_TERMINAL && structure.my) {
                        return structure.store[RESOURCE_ENERGY] < 1e4
                    } else if (structure.structureType == STRUCTURE_NUKER) {
                        return structure.energy < structure.energyCapacity && creep.room.storage.store[RESOURCE_ENERGY] / creep.room.storage.storeCapacity > 0.5
                    } else if (structure.structureType == STRUCTURE_POWER_SPAWN) {
                        return structure.energy / structure.energyCapacity < 0.5 && creep.room.storage.store[RESOURCE_ENERGY] / creep.room.storage.storeCapacity > 0.6
                    }
                }
                return false
            }
        })
        if (target) {
            const action = creep.transfer(target, RESOURCE_ENERGY)
            if (action == ERR_NOT_IN_RANGE) {
                creep.moveTo(target)
            }
        } else {
            if (creep.carry.energy >= creep.carryCapacity) {
                memory.status = 'sleeping'
            } else {
                memory.status = 'getting'
            }
        }

    } else if (memory.status == 'sleeping') {
        if (creep.room.energyAvailable < creep.room.energyCapacityAvailable) {
            memory.status = 'carrying'
        } else {
            if (Game.time % 5 == 0) {
                const towers = creep.room.towers
                for (let tower of towers) {
                    if (tower.energy / tower.energyCapacity < 0.75) {
                        memory.status = 'carrying'
                        break
                    }
                }
            }

        }
    }

}

function born(spawnnow, creepname, memory, isonly) {
    let body = {
        'carry': 33,
        'move': 17
    }
    let bodyarray = tools.generatebody(body, spawnnow)
    let ans = spawnnow.spawnCreep(
        bodyarray,
        creepname,
        {
            memory: {
                status: 'getting',
                missionid: memory.gettarget
            }
        }
    )
    if (isonly) {
        while (ans == ERR_NOT_ENOUGH_ENERGY) {
            let maxbody = -1
            for (let name in body) {
                body[name] /= 1.2
                maxbody = Math.max(maxbody, Math.ceil(body[name]))
            }
            bodyarray = tools.generatebody(body)
            ans = spawnnow.spawnCreep(
                bodyarray,
                creepname,
                {
                    memory: {
                        status: 'getting',
                        missionid: memory.gettarget
                    }
                }
            )
            if (maxbody == 1) break
        }
    }

    return ans
}