let powerSleep = {}

module.exports.get = function (creep, memory) {
    const gettarget = Game.getObjectById(memory.gettarget)
    let act = null
    if (memory.thor) {
        act = creep.withdraw(gettarget, memory.type, Math.min(gettarget.store[memory.type], memory.thor, creep.carryCapacity - _.sum(creep.carry)))
    } else {
        act = creep.withdraw(gettarget, memory.type)
    }
    if (act === ERR_NOT_IN_RANGE) {
        creep.moveTo(gettarget, {reusePath: 10})
    } else if (act === OK || act === ERR_NOT_ENOUGH_RESOURCES || act === ERR_FULL) {
        memory.status = memory.nexts
    } else {
        memory.status = 'miss'
    }
}

module.exports.fill = function (creep, memory) {
    let filltarget = Game.getObjectById(memory.filltarget)
    const act = creep.transfer(filltarget, memory.type, memory.fillthor)
    if (act === ERR_NOT_IN_RANGE) {
        creep.moveTo(filltarget, {reusePath: 10})
    } else if (act === OK || act === ERR_NOT_ENOUGH_RESOURCES || act === ERR_FULL) {
        memory.status = 'miss'
    } else {
        memory.status = 'miss'
    }
}
module.exports.fillNuke = function (creep, memory, room) {
    const target = room.nuker
    if (room.terminal.store[RESOURCE_GHODIUM] && target && target.ghodium < 5000) {
        creep.memory = {
            type: RESOURCE_GHODIUM,
            gettarget: room.terminal.id,
            status: 'getting',
            nexts: 'filling',
            filltarget: target.id,
            thor: target.ghodiumCapacity - target.ghodium
        }
        return true
    }
    return false

}
module.exports.fillPower = function (creep, memory, room) {
    if (room.powerSpawn.power === 0 && (room.terminal.store[RESOURCE_POWER] || creep.store.power)) {
        creep.memory = {
            type: RESOURCE_POWER,
            gettarget: room.terminal.id,
            status: 'getting',
            nexts: 'filling',
            filltarget: room.powerSpawn.id,
            thor: 100
        }
        return true
    }
    return false

}
module.exports.factoryFill = function (creep, memory, room) {
    if (room.memory.factory && room.memory.factory.status === 'fill' && room.memory.factory.thor > 0) {
        const target = room.factory
        Game.factory.miss(room)
        creep.memory = {
            type: room.memory.factory.fillType,
            gettarget: room.terminal.id,
            status: 'getting',
            nexts: 'filling',
            filltarget: target.id,
            thor: room.memory.factory.thor,
        }
        return true
    }
    return false

}
module.exports.factoryGet = function (creep, memory, room) {
    if (room.memory.factory && room.memory.factory.status === 'get' && room.memory.factory.thor > 0) {
        const target = room.factory
        Game.factory.miss(room)
        creep.memory = {
            type: room.memory.factory.fillType,
            gettarget: target.id,
            status: 'getting',
            nexts: 'filling',
            filltarget: room.terminal.id,
            thor: room.memory.factory.thor,
        }
        return true
    }
    return false

}
module.exports.boostEnergy = function (creep, memory, room) {
    if (room.memory.reaction && room.memory.reaction.status === 'boost' && (!room.memory.reaction.boostReady)) {
        for (let lab of room.labs) {
            if (lab.energy < lab.energyCapacity) {
                creep.memory = {
                    type: RESOURCE_ENERGY,
                    gettarget: room.storage.id,
                    status: 'getting',
                    nexts: 'filling',
                    filltarget: lab.id,
                    thor: lab.energyCapacity - lab.energy
                }
                return true
            }
        }
    }
    return false
}

module.exports.boostMine = function (creep, memory, room) {
    if (room.memory.reaction && room.memory.reaction.status === 'boost' && (!room.memory.reaction.boostReady)) {
        const boostList = room.memory.reaction.boostList
        for (let index in boostList) {
            const type = boostList[index]
            const lab = room.labs[index]
            Game.terminal.needBoost(room)
            if (lab.mineralAmount < lab.store.getCapacity(lab.mineralType || type)) {
                memory.type = type
                memory.gettarget = room.terminal.id
                memory.filltarget = lab.id
                memory.status = 'getting'
                memory.nexts = 'filling'
                memory.thor = lab.store.getCapacity(lab.mineralType || type) - lab.mineralAmount
                return true
            }
        }
        room.memory.reaction.boostReady = true
    }
    return false

}

module.exports.labCollect = function (creep, memory, room) {
    if (room.memory.reaction && room.memory.reaction.status === 'collect') {
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
                return true
            }
        }
        room.memory.reaction.status = 'miss'
        require('reaction').work(room)
    }
    return false
}

module.exports.labFill = function (creep, memory, room) {
    if (room.memory.reaction && room.memory.reaction.status === 'fill') {
        const mine = require('reaction').reaction[room.memory.reaction.type]
        for (let x in mine) {
            let lab = Game.getObjectById(room.memory.lab.input[x])
            if (lab.mineralAmount < 3000 && (room.terminal.store[mine[x]] || 0) >= (3000 - lab.mineralAmount)) {

                creep.memory = {
                    type: mine[x],
                    gettarget: room.storage && room.storage.store[mine[x]] ? room.storage.id : room.terminal.id,
                    status: 'getting',
                    nexts: 'filling',
                    filltarget: lab.id,
                    thor: lab.store.getCapacity(lab.mineralType || mine[x]) - lab.mineralAmount
                }
                return true
            }
        }
        require('reaction').work(room)

    }
    return false
}
module.exports.dropAll = function (creep, memory, room) {
    if (creep.store.getFreeCapacity() === 0 || (memory.status === 'getting' && creep.store.getFreeCapacity(memory.type) === 0) || (memory.status === 'filling' && creep.store.getUsedCapacity(memory.type) === 0)) {
        let type = _.max(_.filter(Object.keys(creep.store), o => o !== RESOURCE_OPS), p => creep.store[p] || 0)
        creep.memory = {
            type: type,
            status: 'filling',
            filltarget: room.terminal.id,
        }
        return true
    }
    return false
}
module.exports.oplab = function (creep, memory, room) {
    if (!room.memory.reaction || room.memory.reaction.status !== 'react') {
        return false
    }
    if (!creep.powers[PWR_OPERATE_LAB] || creep.powers[PWR_OPERATE_LAB].cooldown || (creep.store[RESOURCE_OPS] || 0) < 20) {
        return false
    }
    if (powerSleep[creep.name] && powerSleep[creep.name].oplabSleep && powerSleep[creep.name].oplabSleep > Game.time) {
        return false
    }
    let ans = room.memory.lab.output.some(obj => {
        let lab = Game.getObjectById(obj)
        if (!lab.effects || !lab.effects[0]) {
            creep.memory = {
                power: PWR_OPERATE_LAB,
                target: obj,
                status: 'gopower'
            }
            return true
        }
    })
    if (!ans) {
        powerSleep[creep.name] = powerSleep[creep.name] || {}
        powerSleep[creep.name].oplabSleep = Game.time + (_.min(room.memory.lab.output, obj => {
            try {
                return Game.getObjectById(obj).effects[0].ticksRemaining || 999
            } catch (e) {
                return 999
            }
        }) || 1000)
    }
    if (ans) {
        return true
    }
    return false

}

module.exports.genSource = function (creep, memory, room) {
    if (!creep.powers[PWR_REGEN_SOURCE] || creep.powers[PWR_REGEN_SOURCE].cooldown) {
        return false
    }
    if (powerSleep[creep.name] && powerSleep[creep.name].gensourceSleep && powerSleep[creep.name].gensourceSleep > Game.time) {
        return false
    }
    let source = room.find(FIND_SOURCES)
    let ans = source.some(o => {
        if (!o.effects || !o.effects[0]) {
            creep.memory = {
                power: PWR_REGEN_SOURCE,
                target: o.id,
                status: 'gopower'
            }
            return true
        }
    })


    if (!ans) {
        powerSleep[creep.name] = powerSleep[creep.name] || {}
        powerSleep[creep.name].gensourceSleep = Game.time + (_.min(source, obj => {
            try {
                return obj.effects[0].ticksRemaining || 100
            } catch (e) {
                return 100
            }
        }) || 100)
    }
    return !!ans


}

module.exports.opTower = function (creep, memory, room) {
    if (!creep.powers[PWR_OPERATE_TOWER] || creep.powers[PWR_OPERATE_TOWER].cooldown || (creep.store[RESOURCE_OPS] || 0) < 10) {
        return false
    }
    if (powerSleep[creep.name] && powerSleep[creep.name].opTowerSleep && powerSleep[creep.name].opTowerSleep > Game.time) {
        return false
    }
    let tower = room.towers
    let ans = tower.some(o => {
        if (!o.effects || !o.effects[0]) {
            creep.memory = {
                power: PWR_OPERATE_TOWER,
                target: o.id,
                status: 'gopower'
            }
            return true
        }
    })


    if (!ans) {
        powerSleep[creep.name] = powerSleep[creep.name] || {}
        powerSleep[creep.name].opTowerSleep = Game.time + (_.min(tower, obj => {
            try {
                return obj.effects[0].ticksRemaining || 10
            } catch (e) {
                return 10
            }
        }) || 10)
    }
    return !!ans


}