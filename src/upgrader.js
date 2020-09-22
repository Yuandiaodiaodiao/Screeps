var upgradertime = {}

function work(creep) {

    const memory = creep.memory
    if (memory.status === 'going') {
        let target = Game.getObjectById(memory.missionid)
        let container = Game.getObjectById(memory.container)
        if (!container) {
            container = _.min(target.pos.findInRange(FIND_STRUCTURES, 3, {
                filter: obj => obj.structureType === STRUCTURE_CONTAINER
            }), o => o.pos.getRangeTo(target.pos))
            if (container) {
                memory.container = container.id
            } else {
                console.log('no container upgrade' + creep.name)
            }
        }

        let workPos
        if (memory.workPos) {
            workPos = new RoomPosition(...memory.workPos)
        } else {
            workPos = _.min(Game.tools.allnearavailable(container.pos, true), o => o.getRangeTo(container.pos))
            if(!workPos){
                memory.workPos = undefined
            }else{
                memory.workPos = [workPos.x, workPos.y, workPos.roomName]
                if (!(memory.workPos[0] && memory.workPos[1] && memory.workPos[2])) {
                    memory.workPos = undefined
                }
            }

        }
        if (!workPos) return
        if (!creep.pos.isEqualTo(workPos)) {
            creep.moveTo(workPos, {reusePath: 100})
        } else {
            memory.workPos = undefined
            memory.status = 'upgrading'
            creep.signController(creep.room.controller, '☕')
        }
    } else if (memory.status === 'upgrading') {
        let target = Game.getObjectById(memory.missionid)
        let container = Game.getObjectById(memory.container)
        if (!container || container.structureType !== STRUCTURE_CONTAINER) {
            container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: obj => obj.structureType === STRUCTURE_CONTAINER
            })
            if (container) memory.container = container.id
        } else if (creep.carry.energy <= 40 && container.store.energy > 0) {
            creep.withdraw(container, RESOURCE_ENERGY)
            upgradertime[creep.pos.roomName] = Game.time
        }
        const action = creep.upgradeController(target)
        if (action === ERR_NOT_IN_RANGE) {
            memory.status = 'going'
        } else if (action === ERR_NOT_ENOUGH_RESOURCES) {
            upgradertime[creep.pos.roomName] = Game.time
            if (creep.room.controller.level <= 5) {
                memory.status = 'getting'
            } else if (creep.pos.getRangeTo(creep.room.controller.pos) > 3 || creep.pos.getRangeTo(container.pos) > 1) {
                memory.status = 'going'
            }
        } else if (action === OK) {
            memory._move = undefined
        }
    }
    if (memory.status === 'getting') {
        upgradertime[creep.pos.roomName] = Game.time
        let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: obj => {
                if (creep.room.controller.level >= 5) {
                    return obj.structureType === STRUCTURE_CONTAINER
                } else {
                    return (obj.structureType === STRUCTURE_LINK && obj.energy > 0)
                        || (obj.structureType === STRUCTURE_TOWER && obj.energy > 200)
                        || (obj.structureType === STRUCTURE_STORAGE && obj.store[RESOURCE_ENERGY] > 5e4)
                        || (obj.structureType === STRUCTURE_CONTAINER && obj.store[RESOURCE_ENERGY] > 1e3)
                }
            }

        })
        if (target) {
            memory.container = target.id
            if (creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(target)
            }
        }
        if (creep.carry.energy >= creep.carryCapacity) {
            memory.status = 'upgrading'
        }
    }
}

function born(spawnnow, creepname, memory) {
    let body = {
        'work': 40,
        'carry': 4,
        'move': 6
    }
    if (Game.getObjectById(memory.controller).level >= 8) {
        body = {
            'work': 15,
            'carry': 4,
            'move': 5
        }
    } else if (Game.getObjectById(memory.controller).level <= 4) {
        body = {
            'work': 16,
            'move': 8,
            'carry': 12
        }
    }
    let bodyarray = require('tools').generatebody(body, spawnnow)
    return spawnnow.spawnCreep(
        bodyarray,
        creepname,
        {
            memory: {
                status: 'going',
                missionid: memory.controller
            }
        }
    )
}




function miss(room) {
    Memory.nowUpgrade=Memory.nowUpgrade||{}
    let nowUpgrade = Memory.nowUpgrade
    let role_num_fix = Game.config.role_num_fix
    role_num_fix[room.name] = role_num_fix[room.name] || {}
    if (room.storage && room.controller.level >= 4 && room.controller.level <= 7) {
        let persent = room.storage.store[RESOURCE_ENERGY] / room.storage.store.getCapacity()
        let num = Math.ceil((persent - 0.3) / 0.05)
        num = Math.max(0, num)
        num = Math.min(4, num)
        role_num_fix[room.name].upgrader = num
    }
    if (room.controller.level === 8) {
        role_num_fix[room.name].upgrader = Math.min(role_num_fix[room.name].upgrader, 1)
        if (room.controller.ticksToDowngrade && room.controller.ticksToDowngrade > 100000) {
            role_num_fix[room.name].upgrader = 0
        } else {
            role_num_fix[room.name].upgrader = 1
        }
    }

    if (room.controller.level >= 4 && room.controller.ticksToDowngrade && room.controller.ticksToDowngrade < 3000 && role_num_fix[room.name].upgrader === 0) {
        role_num_fix[room.name].upgrader = 1
    }
    if (room.controller.level === 8 && room.storage && room.storage.store[RESOURCE_ENERGY] / room.storage.store.getCapacity() >= 0.9 && Game.cpu.bucket > 9000 && Object.keys(Memory.powerPlan).length === 0) {
        role_num_fix[room.name].upgrader = 1
    }
    if (!room.storage) {
        role_num_fix[room.name].upgrader = 0
    }
    if (nowUpgrade[room.name]) {
        role_num_fix[room.name].upgrader = 1
    }
    if (room.controller.level === 8) {
        //冲gcl决策
        if (room.storage.store[RESOURCE_ENERGY] / room.storage.store.getCapacity() >= 0.7 && Game.cpu.bucket > 9000 && Object.keys(Memory.powerPlan).length <= 2) {
            //正在升级的数量
            const nowLength = Object.keys(nowUpgrade).length
            const nowCpuUse = Memory.grafana.cpuavg + nowLength * 0.4
            const freeCpu = 17 - nowCpuUse
            // console.log(`${room.name} freeCpu=${freeCpu}`)
            if (freeCpu > 0.4) {
                nowUpgrade[room.name] = true
                //确认升级
                role_num_fix[room.name].upgrader = 1
            } else {
                delete nowUpgrade[room.name]
            }
        } else {
            delete nowUpgrade[room.name]
        }
    }


    // if (room.name == 'E29N38') {
    //     console.log('E29N38 upgrader=' + role_num_fix[room.name].upgrader)
    // }
    return role_num_fix[room.name].upgrader
}

module.exports = {
    'work': work,
    'born': born,
    'miss': miss,
    'upgradertime': upgradertime
};
