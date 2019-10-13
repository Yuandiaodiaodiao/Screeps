function work(creep) {
    const terminal = creep.room.terminal
    let memory = creep.memory
    if (creep.memory.status == 'miss') {
        memory = creep.memory = {
            role: creep.memory.role,
            status: 'miss',
            missionid: creep.memory.missionid,
        }
        const room = creep.room
        if (creep.memory.role) {
            if (memory.role == 'power' && room.powerSpawn && creep.room.powerSpawn.power == 0) {
                memory.type = RESOURCE_POWER
                memory.gettarget = room.terminal.id
                memory.filltarget = room.powerSpawn.id
                memory.status = 'getting'
                memory.nexts = 'filling'
                memory.thor = 100
            }
        } else if (terminal.store[RESOURCE_ENERGY] > 14000 && _.sum(room.storage.store) / room.storage.storeCapacity < 0.95) {
            memory.type = RESOURCE_ENERGY
            memory.gettarget = room.terminal.id
            memory.filltarget = room.storage.id
            memory.status = 'getting'
            memory.nexts = 'filling'
        } else if (terminal.store[RESOURCE_GHODIUM] && room.nuker && room.nuker.ghodium < 5000) {
            memory.type = RESOURCE_GHODIUM
            memory.gettarget = room.terminal.id
            memory.filltarget = room.nuker.id
            memory.status = 'getting'
            memory.nexts = 'filling'
            memory.thor = 5000 - room.nuker.ghodium
        } else {
            if (creep.ticksToLive < 50) {
                creep.memory.status = 'suicide'
                return
            }

            let ok = false
            for (let lab of room.labs) {
                if (lab.energy < lab.energyCapacity) {
                    memory.type = RESOURCE_ENERGY
                    memory.gettarget = room.storage.id
                    memory.filltarget = lab.id
                    memory.status = 'getting'
                    memory.nexts = 'filling'
                    memory.thor = lab.energyCapacity - lab.energy
                    ok = true
                    break
                }
            }
            if (!ok && room.memory.reaction && room.memory.reaction.status === 'boost') {
                const boostList = room.memory.reaction.boostList
                for (let index in boostList) {
                    const type = boostList[index]
                    const lab = room.labs[index]
                    if (lab.mineralAmount < lab.mineralCapacity) {
                        memory.type = type
                        memory.gettarget = room.terminal.id
                        memory.filltarget = lab.id
                        memory.status = 'getting'
                        memory.nexts = 'filling'
                        memory.thor = lab.mineralCapacity - lab.mineralAmount
                        ok = true
                        break
                    }
                }
                if(ok==false){
                    room.memory.reaction.boostReady=true
                }else{
                    room.memory.reaction.boostReady=false
                }
            }
            if (!ok && room.memory.reaction && room.memory.reaction.status === 'collect') {
                const labs = room.labs
                for (let lab of labs) {
                    if (lab.mineralAmount > 0) {
                        memory.type = lab.mineralType
                        memory.gettarget = lab.id
                        memory.status = 'getting'
                        memory.nexts = 'filling'
                        memory.filltarget = room.terminal.id
                        ok = true
                        break
                    }
                }
            }


            if (!ok) {
                if (_.sum(creep.carry) > 0) {
                    for (let type in creep.carry) {
                        memory.type = type
                        memory.filltarget = room.terminal.id
                        memory.status = 'filling'
                        memory.nexts = 'miss'
                        ok = true
                        break
                    }
                }
            }
            if (!ok) {
                creep.memory.status = 'sleep'
            }
        }
    } else if (creep.memory.status === 'sleep') {
        if (Game.time % 10 === 0) {
            creep.memory.status = 'miss'
        }
    } else if (creep.memory.status === 'suicide') {
        Game.tools.suicide(creep, creep.room.terminal)
        return
    }
    if (memory.status == 'filling') {
        let filltarget = Game.getObjectById(memory.filltarget)
        const act = creep.transfer(filltarget, memory.type, memory.fillthor)
        if (act == ERR_NOT_IN_RANGE) {
            creep.moveTo(filltarget, {reusePath: 10})
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
            creep.moveTo(gettarget, {reusePath: 10})
        } else if (act == OK) {
            memory.status = memory.nexts
        } else if (act == ERR_NOT_ENOUGH_RESOURCES) {
            memory.status = 'miss'
        } else if (act == ERR_FULL) {
            memory.status = memory.nexts
        }
    }
    creep.memory = memory

}


function born(spawnnow, creepname, memory) {

    let body = {
        'carry': 32,
        'move': 16
    }
    if (memory.capacity) {
        body = {
            'carry': Math.ceil(memory.capacity / 50),
            'move': Math.ceil(memory.capacity / 50)
        }
    }
    let bodyarray = require('tools').generatebody(body, spawnnow)
    return spawnnow.spawnCreep(
        bodyarray,
        creepname,
        {
            memory: {
                status: 'miss',
                missionid: memory.roomName,
                role: memory.role,
            }
        }
    )
}

function miss(room) {
    //terminalmamager
    room.memory.missions.terminalmanager = {}
    const terminal = room.terminal
    if (terminal) {
        if (!room.controller.isPowerEnabled && terminal.store[RESOURCE_POWER] > 1400 && room.storage.store[RESOURCE_ENERGY] / room.storage.storeCapacity > 0.65 && room.powerSpawn) {
            room.memory.missions.terminalmanager[room.name] = {
                roomName: room.name,
                capacity: 100,
                role: 'power',
            }
        }
        if (terminal.store[RESOURCE_ENERGY] > 90000 || (!room.controller.isPowerEnabled && terminal.store[RESOURCE_GHODIUM] && terminal.store[RESOURCE_GHODIUM] >= 1000 && room.nuker && room.nuker.ghodium < 5000)) {
            room.memory.missions.terminalmanager[room.name] = {
                roomName: room.name,
            }
        }
    }
    if (_.size(room.memory.missions.terminalmanager) == 0) {
        room.memory.missions.terminalmanager = undefined
    }


}
// Game.rooms['E29N38'].memory.missions.terminalmanager={}; Game.rooms['E29N38'].memory.missions.terminalmanager['E29N38'] = {roomName:'E29N38'};
module.exports = {
    'work': work,
    'born': born,
    'miss': miss
};