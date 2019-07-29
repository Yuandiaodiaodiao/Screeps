module.exports = {
    'work': work,
    'born': born
};
var tools = require('tools')

function work(name) {
    //fill

    let creep = Game.creeps[name]
    let nowstatus = creep.memory.status
    if (creep.carry.energy == 0) {
        creep.memory.status = 'getting';
    }

    if (creep.memory.status == 'getting') {

        let target = Game.getObjectById(creep.memory.missionid)

        if (target && target.store[RESOURCE_ENERGY] > 0) {
            let action = creep.withdraw(target, RESOURCE_ENERGY)
            if (action == ERR_NOT_IN_RANGE) {
                creep.moveTo(target)
            } else if (action == OK) {
                creep.memory.status = 'carrying'
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
                creep.memory.status = 'carrying'
            }
        }
        if (creep.carry.energy >= creep.carryCapacity) {
            creep.memory.status = 'carrying';
        }
    }
    if (creep.memory.status == 'carrying') {
        let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return ((structure.structureType == STRUCTURE_SPAWN
                        || structure.structureType == STRUCTURE_EXTENSION
                    ) && structure.energy < structure.energyCapacity)
                    || (structure.structureType == STRUCTURE_TOWER &&
                        structure.energy / structure.energyCapacity < 0.75
                        ||(structure.structureType==STRUCTURE_TERMINAL &&
                            structure.store[RESOURCE_ENERGY]<1e4)
                    )
            }
        })
        if (target) {
            let action = creep.transfer(target, RESOURCE_ENERGY)
            if (action == ERR_NOT_IN_RANGE) {
                creep.moveTo(target)
            } else if (action == OK) {
                let target2 = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (((structure.structureType == STRUCTURE_SPAWN
                                || structure.structureType == STRUCTURE_EXTENSION
                            ) && structure.energy < structure.energyCapacity)
                            || (structure.structureType == STRUCTURE_TOWER &&
                                structure.energy / structure.energyCapacity < 0.75)
                            ) &&
                            structure.id != target.id
                    }
                })
                creep.moveTo(target2)
            }
        } else {
            if (creep.carry.energy >= creep.carryCapacity) {

            } else {
                creep.memory.status = 'getting'
            }
        }

    }

}

function born(spawnnow, creepname, memory) {
    let body = {
        'carry': 18,
        'move': 9
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
    return ans
}