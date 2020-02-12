module.exports = {
    'work': work,
    'born': born
};
var tools = require('tools')

function havePc(creep) {
    let pc = Game.powerCreeps[creep.room.name]
    return (pc && pc.ticksToLive && pc.level >= 10 && !Game.defend.defendRoom.includes(creep.room.name))
}

function work(creep) {
    //fill
    const memory = creep.memory
    if (creep.store.energy === 0 && memory.status !== 'suicide') {
        memory.status = 'getting'
    }

    const room = creep.room

    if (memory.status === 'fillextension') {
        let step = memory.step || 0
        let extensionList = Game.tools.extensionList[room.name] || Game.tools.solveExtension(room)
        if (!extensionList) {
            memory.status = 'getting'
            console.log('err no extensionList')
            return
        }
        let target = null

        while ((target = Game.tools.getExtByOrder(room, step))) {
            if (target.store.getFreeCapacity('energy') === 0) {
                step++
                continue
            }
            const act = creep.transfer(target, RESOURCE_ENERGY)
            if (act === ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {reusePath: 10})
            } else if (act === OK || act === ERR_FULL) {
                if (creep.store.energy - target.store.getFreeCapacity('energy') === 0) {
                    step++
                    memory.status = 'getting'
                } else if (creep.carry.energy - (target.energyCapacity - target.energy) < 0) {
                    memory.status = 'getting'
                } else {
                    step++
                    //pre move
                    if ((target = Game.tools.getExtByOrder(room, step)) && !creep.pos.isNearTo(target) && target.energy < target.energyCapacity) {
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
    } else if (memory.status === 'miss') {
        let target = _.find(room.spawns, o => o.energy < 250)
        if (!target) target = _.find(room.towers, o => o.energy / o.energyCapacity < 0.75)
        if (!target && room.energyAvailable / room.energyCapacityAvailable > havePc(creep) ? 0.4 : 0.9) {
            if (room.terminal && room.terminal.my && room.terminal.store[RESOURCE_ENERGY] < 1e4) {
                target = room.terminal
            } else if (room.nuker && room.nuker.energy < room.nuker.energyCapacity && room.storage.store[RESOURCE_ENERGY] / room.storage.store.getCapacity() > 0.4) {
                target = room.nuker
            } else if (room.powerSpawn && room.powerSpawn.energy < 5000 - 1600 && room.storage.store[RESOURCE_ENERGY] / room.storage.store.getCapacity() > Game.config.powerLimit) {
                target = room.powerSpawn
            } else if (room.factory && room.factory.store.getUsedCapacity(RESOURCE_ENERGY) < 8e3) {
                target = room.factory
            }
        } else if (!target) {

            if (havePc(creep)) {
                if (room.energyAvailable / room.energyCapacityAvailable < 0.4) {
                    memory.status = 'fillextension'
                    memory.step = 0
                }
            } else {
                memory.status = 'fillextension'
                memory.step = 0
            }

        }
        if (target) {
            memory.target = target.id
            memory.status = 'filling'
        } else if (Game.time % 2001 == 0 && creep.body.length < 48 && room.energyCapacityAvailable > creep.body.length * 50 + 500) {
            creep.suicide()
        } else if (creep.carry.energy < creep.carryCapacity) {
            memory.status = 'getting'
        } else {
            memory.status = 'sleep'
            if (creep.ticksToLive <= 40) {
                memory.status = 'suicide'
                Game.tools.suicide(creep)
            }
            memory.target = undefined
            memory.step = undefined
        }
    } else if (memory.status == 'sleep' && Game.time % 5 == 0) {
        if (creep.ticksToLive < 20) {
            memory.status = 'suicide'
        } else if ((room.energyAvailable < room.energyCapacityAvailable - (room.controller.level >= 5 ? 200 : 50))) {
            if (havePc(creep)) {
                if (room.energyAvailable / room.energyCapacityAvailable < 0.4) {
                    memory.status = 'fillextension'
                    memory.step = 0
                }
            } else {
                memory.status = 'fillextension'
                memory.step = 0
            }
        }
        if (memory.status === 'sleep') {
            memory.status = 'miss'
        }
    }
    if (memory.status == 'getting') {
        if (creep.ticksToLive < 40) {
            memory.status = 'suicide'
            return
        }
        let target = room.terminal
        if (!target || target.store.energy < 14e3) {
            target = room.storage
        }
        if (!target || target.store.energy === 0) {
            target = Game.getObjectById(memory.missionid)
        }
        if (!target || target.store.energy === 0) {
            target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: obj => obj.store && obj.store[RESOURCE_ENERGY] > 0 && (obj.structureType === STRUCTURE_CONTAINER)
            })
        }
        if (target && target.store[RESOURCE_ENERGY] > 0) {
            const action = creep.withdraw(target, RESOURCE_ENERGY)
            if (action == ERR_NOT_IN_RANGE) {
                creep.moveTo(target)
            } else if (action == OK || action == ERR_FULL) {
                if (memory.step && (!require('tower').enemy[room.name])) {
                    memory.status = 'fillextension'
                    let extensionList = Game.tools.extensionList[room.name] || Game.tools.solveExtension(room)
                    if ((target = Game.tools.getExtByOrder(room, 0))) {
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
        }
    } else if (memory.status === 'filling') {
        const target = Game.getObjectById(memory.target)
        const act = creep.transfer(target, RESOURCE_ENERGY)
        if (act === ERR_NOT_IN_RANGE) {
            creep.moveTo(target, {reusePath: 10})
        } else {
            memory.status = 'miss'
        }
    } else if (memory.status === 'suicide') {
        try {
            require('tools').suicide(creep)
        } catch (e) {
            console.log(`suicide error ${creep.name}`)
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
            if (maxbody == 1 || tools.bodycost(body) <= 300) break
        }
    }
    if (ans === OK) {
        require('tools').solveExtension(spawnnow.room)
    }
    return ans
}