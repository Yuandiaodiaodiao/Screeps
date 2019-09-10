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
    if (memory.status == 'fillextension') {
        let step = memory.step || 0
        let extensionList = require('tools').extensionList[creep.room.name] || require('tools').solveExtension(creep.room)
        if (!extensionList) {
            memory.status = 'carrying'
            console.log('err no extensionList')
            return
        }
        let target = null

        while (target = Game.getObjectById(extensionList[step])) {
            if (target.energy == target.energyCapacity) {
                step++
                continue
            }
            const act = creep.transfer(target, RESOURCE_ENERGY)
            if (act == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {reusePath: 10})
            } else if (act == OK || act == ERR_FULL) {
                if (creep.carry.energy - (target.energyCapacity - target.energy) == 0) {
                    step++
                    memory.status = 'getting'
                } else if (creep.carry.energy - (target.energyCapacity - target.energy) < 0) {
                    memory.status = 'getting'
                } else {
                    step++
                    //pre move
                    if ((target = Game.getObjectById(extensionList[step])) && !creep.pos.isNearTo(target) && target.energy < target.energyCapacity) {
                        creep.moveTo(target, {reusePath: 10})
                    }
                }
            } else if (act == ERR_NOT_ENOUGH_RESOURCES) {
                memory.status = 'getting'
            } else {
                memory.status = 'miss'
            }
            break
        }
        if (step >= extensionList.length) {
            memory.status = 'miss'
            memory.step = undefined
        } else {
            memory.step = step
        }
    } else if (memory.status == 'miss') {
        let target = _.find(creep.room.spawns, o => o.energy < 250)
        if (!target) target = _.find(creep.room.towers, o => o.energy / o.energyCapacity < 0.75)
        if (!target && creep.room.energyAvailable / creep.room.energyCapacityAvailable > 0.9) {
            if (creep.room.terminal && creep.room.terminal.my && creep.room.terminal.store[RESOURCE_ENERGY] < 1e4) {
                target = creep.room.terminal
            } else if (creep.room.nuker && creep.room.nuker.energy < creep.room.nuker.energyCapacity && creep.room.storage.store[RESOURCE_ENERGY] / creep.room.storage.storeCapacity > 0.5) {
                target = creep.room.nuker
            } else if (creep.room.powerSpawn && creep.room.powerSpawn.energy / creep.room.powerSpawn.energyCapacity < 0.65 && creep.room.storage.store[RESOURCE_ENERGY] / creep.room.storage.storeCapacity > 0.6) {
                target = creep.room.powerSpawn
            }
        } else if (!target) {
            memory.status = 'fillextension'
            memory.step = 0
        }
        if (target) {
            memory.target = target.id
            memory.status = 'filling'
        } else if (Game.time % 2001 == 0 && creep.body.length < 48 && creep.room.energyCapacityAvailable > creep.body.length * 50 + 500) {
            creep.suicide()
        } else if (creep.carry.energy < creep.carryCapacity) {
            memory.status = 'getting'
        } else {
            memory.status = 'sleep'
            memory.target = undefined
            memory.step = undefined
        }
    } else if (memory.status == 'sleep' && Game.time % 5 == 0) {
        if (creep.room.energyAvailable < creep.room.energyCapacityAvailable - 200) {
            memory.status = 'fillextension'
            memory.step = 0
        } else {
            memory.status = 'miss'
        }
    }

    if (memory.status == 'getting') {
        let target = Game.getObjectById(memory.missionid)
        if (target && target.store[RESOURCE_ENERGY] > 0) {
            const action = creep.withdraw(target, RESOURCE_ENERGY)
            if (action == ERR_NOT_IN_RANGE) {
                creep.moveTo(target)
            } else if (action == OK || action == ERR_FULL) {
                if (memory.step) {
                    memory.status = 'fillextension'
                    let extensionList = require('tools').extensionList[creep.room.name] || require('tools').solveExtension(creep.room)
                    if (target = Game.getObjectById(extensionList[0])) {
                        if (target.energy < target.energyCapacity) {
                            memory.step = 0
                        }
                    }
                } else {
                    memory.status = 'miss'
                }
            } else {
                console.log(`${creep.name}error ${action}`)
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

    } else if (memory.status == 'carrying') {
        let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                if (structure.structureType == STRUCTURE_EXTENSION) {
                    return structure.energy < structure.energyCapacity
                } else if (structure.structureType == STRUCTURE_SPAWN) {
                    return structure.energy < 250
                } else if (structure.structureType == STRUCTURE_TOWER) {
                    return structure.energy / structure.energyCapacity < 0.75
                } else if (creep.room.energyAvailable / creep.room.energyCapacityAvailable > 0.95) {
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

    } else if (memory.status == 'filling') {
        const target = Game.getObjectById(memory.target)
        const act = creep.transfer(target, RESOURCE_ENERGY)
        if (act == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, {reusePath: 10})
        } else {
            memory.status = 'miss'
        }
    }

}

function born(spawnnow, creepname, memory, isonly) {
    let body = {
        'carry': 32,
        'move': 16
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