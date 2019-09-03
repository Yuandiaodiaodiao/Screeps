function work(creep) {
    const room = creep.room
    let memory = creep.memory
    if (memory.status == 'miss') {
        memory = creep.memory = {}
        const ops = creep.carry[RESOURCE_OPS] || 0
        if (creep.ticksToLive && creep.ticksToLive < 200) {
            memory.status = 'renewing'
        } else if (creep.powers[PWR_OPERATE_EXTENSION] && !creep.powers[PWR_GENERATE_OPS].cooldown) {
            let act = creep.usePower(PWR_GENERATE_OPS)
            if (act == ERR_INVALID_ARGS) {
                memory.status = 'enable'
            }
        } else if (room.powerSpawn.power == 0 && room.terminal.store[RESOURCE_POWER]) {
            creep.memory = {
                type: RESOURCE_POWER,
                gettarget: room.terminal.id,
                status: 'getting',
                nexts: 'filling',
                filltarget: room.powerSpawn.id,
                thor: 100
            }
        } else if (ops > 150) {
            creep.memory = {
                type: RESOURCE_OPS,
                status: 'filling',
                filltarget: room.terminal.id,
                fillthor: ops - 120,
            }

        } else if (ops >= 2 && creep.powers[PWR_OPERATE_EXTENSION] && !creep.powers[PWR_OPERATE_EXTENSION].cooldown && room.energyAvailable / room.energyCapacityAvailable < 0.9) {
            creep.memory = {
                power: PWR_OPERATE_EXTENSION,
                target: room.storage.id,
                status: 'gopower'
            }
        } else if (ops < 100 && (room.terminal.store[RESOURCE_OPS] || 0) > (100 - ops)) {
            creep.memory = {
                type: RESOURCE_OPS,
                gettarget: room.terminal.id,
                status: 'getting',
                nexts: 'miss',
                thor: 100 - ops
            }
        } else if (ops >= 100 && creep.powers[PWR_OPERATE_SPAWN] && !creep.powers[PWR_OPERATE_EXTENSION].cooldown && room.spawns[0].spawning && (Game.time - (room.spawns[0].memory.power || 0) > 1000)) {
            //_.find(room.spawns, obj => obj.spawning && (Game.time - (obj.memory.power || 0)) > 1000)
            creep.memory = {
                power: PWR_OPERATE_SPAWN,
                target: room.spawns[0].id,
                status: 'gopower',
                memory: true,
            }
        } else if (room.memory.reaction && room.memory.reaction.status == 'fill') {
            const mine = require('reaction').reaction[room.memory.reaction.type]
            for (let x in mine) {
                let lab = Game.getObjectById(room.memory.lab.input[x])
                if (lab.mineralAmount < 3000 && (room.terminal.store[mine[x]] || 0) >= (3000 - lab.mineralAmount)) {
                    creep.memory = {
                        type: mine[x],
                        gettarget: room.terminal.id,
                        status: 'getting',
                        nexts: 'filling',
                        filltarget: lab.id,
                        thor: lab.mineralCapacity - lab.mineralAmount
                    }
                    break
                }
            }
        } else if (room.memory.reaction && room.memory.reaction.status == 'collect') {
            const labs = room.labs
            for (let lab of labs) {
                if (lab.mineralAmount > 0) {
                    creep.memory = {
                        type: lab.mineralType,
                        gettarget: lab.id,
                        status: 'getting',
                        nexts: 'filling',
                        filltarget: room.terminal.id,
                    }
                    break
                }
            }
        } else if (room.terminal.store[RESOURCE_GHODIUM] && room.nuker && room.nuker.ghodium < 5000) {
            const target = room.nuker
            creep.memory = {
                type: RESOURCE_GHODIUM,
                gettarget: room.terminal.id,
                status: 'getting',
                nexts: 'filling',
                filltarget: target.id,
                thor: target.ghodiumCapacity - target.ghodium
            }
        } else if (!room.controller.isPowerEnabled) {
            memory.status = 'enable'
        } else {

            memory.status = 'sleep'
        }
        memory = creep.memory
    } else if (memory.status == 'sleep') {
        if (Game.time % 5 == 0)
            memory.status = 'miss'
        else return
    }
    if (memory.status == 'filling') {
        let filltarget = Game.getObjectById(memory.filltarget)
        const act = creep.transfer(filltarget, memory.type, memory.fillthor)
        if (act == ERR_NOT_IN_RANGE) {
            creep.moveTo(filltarget)
        } else if (act == OK) {
            if (!creep.carry[memory.type] || creep.carry[memory.type] == 0)
                memory.status = 'miss'
        } else if (act == ERR_NOT_ENOUGH_RESOURCES) {
            memory.status = 'miss'
        } else if (act == ERR_FULL) {
            memory.status = 'miss'
        }
    } else if (memory.status == 'getting') {
        const gettarget = Game.getObjectById(memory.gettarget)
        let act = null
        if (memory.thor) {
            act = creep.withdraw(gettarget, memory.type, Math.min(gettarget.store[memory.type], memory.thor, creep.carryCapacity - _.sum(creep.carry)))
        } else {
            act = creep.withdraw(gettarget, memory.type)
        }
        if (act == ERR_NOT_IN_RANGE) {
            creep.moveTo(gettarget)
        } else if (act == OK) {
            memory.status = memory.nexts
        } else if (act == ERR_NOT_ENOUGH_RESOURCES) {
            memory.status = 'miss'
        } else if (act == ERR_FULL) {
            memory.status = memory.nexts
        }
    } else if (memory.status == 'gopower') {
        const target = Game.getObjectById(memory.target)
        const act = creep.usePower(memory.power, target)
        if (act == ERR_NOT_IN_RANGE) {
            creep.moveTo(target)
        } else if (act == OK) {
            memory.status = 'miss'
            if (memory.memory) {
                target.memory.power = Game.time
            }
        }
    } else if (memory.status == 'enable') {
        let act = creep.enableRoom(room.controller)
        if (act == ERR_NOT_IN_RANGE) {
            creep.moveTo(room.controller)
            creep.room.find(FIND_MY_CREEPS, {filter: obj => obj.name.split('_')[1] == "upgrader"}).forEach(obj => obj.suicide())
        } else if (act == OK) {
            memory.status = 'miss'
        }
    } else if (memory.status == 'renewing') {
        let target = room.powerSpawn
        let act = creep.renew(target)
        if (act == ERR_NOT_IN_RANGE) {
            creep.moveTo(target)
        } else if (act == OK) {
            memory.status = 'miss'
        }
    } else {
        if (!creep.ticksToLive) {
            creep.spawn(Game.rooms[creep.name].find(FIND_STRUCTURES, {filter: obj => obj.structureType == STRUCTURE_POWER_SPAWN})[0])
        }
        memory.status = 'miss'
    }


}

module.exports = {
    'work': work
}