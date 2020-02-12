var sources = {}
var minerals = {}
let labOp = require('labOperator')

function work(creep) {
    const room = Game.rooms[creep.name]
    if(!room){
        return require('warPc').work(creep)
    }
    if (!creep.room) {
        if (!creep.ticksToLive) {
            if (!creep.spawnCooldownTime) {
                creep.spawn(Game.rooms[creep.name].powerSpawn)
            }
        }
        return
    }
    let memory = creep.memory
    if (memory.status === 'miss') {
        memory = creep.memory = {}
        const ops = creep.carry[RESOURCE_OPS] || 0
        if (creep.ticksToLive && creep.ticksToLive < 200) {
            memory.status = 'renewing'
        } else if (creep.powers[PWR_GENERATE_OPS] && !creep.powers[PWR_GENERATE_OPS].cooldown) {
            let act = creep.usePower(PWR_GENERATE_OPS)
            if (act == ERR_INVALID_ARGS) {
                memory.status = 'enable'
            }
        } else if (labOp.dropAll(creep, memory, room)) {

        } else if (labOp.fillPower(creep, memory, room)) {

        } else if (ops > 150) {
            creep.memory = {
                type: RESOURCE_OPS,
                status: 'filling',
                filltarget: room.terminal.id,
                fillthor: ops - 120,
            }

        } else if (ops >= 2 && creep.powers[PWR_OPERATE_EXTENSION] && !creep.powers[PWR_OPERATE_EXTENSION].cooldown && room.energyAvailable / room.energyCapacityAvailable < 0.9&& room.storage&&room.storage.store.energy>10e3) {
            let target = room.storage
            if (room.terminal.store.energy > 40000) {
                target = room.terminal
            }
            creep.memory = {
                power: PWR_OPERATE_EXTENSION,
                target: target.id,
                status: 'gopower'
            }
        } else if (!require('tower').bigEnemy[room.name] && labOp.genSource(creep, memory, room)) {

        } else if ((require('tower').bigEnemy[room.name]||Game.time<require('nukeWall').towerHelp[room.name]) && labOp.opTower(creep, memory, room)) {

        } else if (ops < 100 && (room.terminal.store[RESOURCE_OPS] || 0) > (100 - ops)) {
            creep.memory = {
                type: RESOURCE_OPS,
                gettarget: room.terminal.id,
                status: 'getting',
                nexts: 'miss',
                thor: 100 - ops
            }
        } else if (ops >= 100 && creep.powers[PWR_OPERATE_SPAWN] && !creep.powers[PWR_OPERATE_SPAWN].cooldown && room.spawns[0].spawning && (!room.spawns[0].effects || room.spawns[0].effects.length === 0)) {
            //_.find(room.spawns, obj => obj.spawning && (Game.time - (obj.memory.power || 0)) > 1000)
            creep.memory = {
                power: PWR_OPERATE_SPAWN,
                target: room.spawns[0].id,
                status: 'gopower',
                memory: true,
            }
        } else if (labOp.oplab(creep, memory, room)) {

        } else if (labOp.labFill(creep, memory, room)) {

        } else if (labOp.labCollect(creep, memory, room)) {

        } else if (labOp.boostEnergy(creep, memory, room)) {

        } else if (labOp.boostMine(creep, memory, room)) {

        } else if (labOp.fillNuke(creep, memory, room)) {

        } else if (!room.controller.isPowerEnabled) {
            memory.status = 'enable'
        } else if (room.terminal.store[RESOURCE_ENERGY] > 18000 && _.sum(room.storage.store) / room.storage.store.getCapacity() < 0.95) {
            memory.type = RESOURCE_ENERGY
            memory.gettarget = room.terminal.id
            memory.filltarget = room.storage.id
            memory.status = 'getting'
            memory.nexts = 'filling'
        } else if (ops >= 10 && creep.powers[PWR_OPERATE_OBSERVER] && !creep.powers[PWR_OPERATE_OBSERVER].cooldown) {
            creep.memory = {
                power: PWR_OPERATE_OBSERVER,
                target: room.observer.id,
                status: 'gopower'
            }
        } else if (creep.powers[PWR_REGEN_MINERAL] && !creep.powers[PWR_REGEN_MINERAL].cooldown && minerals[creep.name]) {
            if (Game.getObjectById(minerals[creep.name]).ticksToRegeneration) {
                delete minerals[creep.name]
            } else {
                creep.memory = {
                    power: PWR_REGEN_MINERAL,
                    target: minerals[creep.name],
                    status: 'gopower',
                }
            }
        } else if (labOp.factoryFill(creep, memory, room)) {

        } else if (labOp.factoryGet(creep, memory, room)) {

        } else {
            memory.status = 'sleep'
        }
        memory = creep.memory
    } else if (memory.status === 'sleep') {
        if (Game.time % 5 === 0) {
            memory.status = 'miss'

            // if (!minerals[creep.name]) {
            //     const mine = room.find(FIND_MINERALS)[0]
            //     if (!mine.ticksToRegeneration) {
            //         minerals[creep.name] = mine.id
            //     } else {
            //         delete minerals[creep.name]
            //     }
            // }
        } else return
    }
    if (memory.status === 'filling') {
        require('labOperator').fill(creep, memory)
    } else if (memory.status === 'getting') {
        require('labOperator').get(creep, memory)
    } else if (memory.status == 'gopower') {
        const target = Game.getObjectById(memory.target)
        const act = creep.usePower(memory.power, target)
        if (act == ERR_NOT_IN_RANGE) {
            creep.moveTo(target)
        } else if (act == OK) {
            memory.status = 'miss'
            if (memory.memory) {
                target.memory.power = Game.time
            } else if (memory.source) {
                const s = _.find(sources[creep.name], o => o[0] === memory.target)
                if (s) {
                    s[1] = Game.time
                }
            }
        } else {
            memory.status = 'miss'
        }
    } else if (memory.status == 'enable') {
        let act = creep.enableRoom(room.controller)
        if (act == ERR_NOT_IN_RANGE) {
            creep.moveTo(room.controller)
            room.find(FIND_MY_CREEPS, {filter: obj => obj.name.split('_')[1] === "upgrader"}).forEach(obj => obj.suicide())
        } else if (act == OK) {
            memory.status = 'miss'
        }
    } else if (memory.status == 'renewing') {
        let target = room.powerSpawn
        let act = creep.renew(target)
        if (act == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, {reusePath: 10})
        } else if (act == OK) {
            memory.status = 'miss'
        }
    } else {
        if (memory.status && memory.status == 'sleep') {

        } else
            memory.status = 'miss'
    }


}

module.exports = {
    'work': work
}