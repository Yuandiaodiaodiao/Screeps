function work(creep) {
    const terminal = creep.room.terminal
    if (creep.memory.status == 'getting') {
        let act = creep.withdraw(terminal, creep.memory.type)
        if (act == ERR_NOT_IN_RANGE) {
            creep.moveTo(terminal,{reusePath: 10})
        } else if (act == OK) {
            creep.memory.status = 'carrying'
        } else if (act == ERR_NOT_ENOUGH_RESOURCES) {
            creep.memory.status = 'miss'
        } else if (act == ERR_FULL) {
            creep.memory.status = 'carrying'
        }
    } else if (creep.memory.status == 'carrying') {
        let target = Game.getObjectById(creep.memory.target)
        const act = creep.transfer(target, creep.memory.type)
        // console.log(act)
        if (act == ERR_NOT_IN_RANGE) {
            creep.moveTo(target,{reusePath: 10})
        } else if (act == OK) {

        }else if(act==ERR_NOT_ENOUGH_RESOURCES){
            if ((creep.carry[creep.memory.type] || 0) == 0)
                creep.memory.status = 'miss'
        }
    } else if (creep.memory.status == 'miss') {
        if (Game.time % 5 == 0) {
            if (creep.memory.role) {
                if (creep.memory.role == 'power' && creep.room.powerSpawn.power == 0) {
                    creep.memory.type = RESOURCE_POWER
                    creep.memory.target = creep.room.powerSpawn.id
                    creep.memory.status = 'getting'
                }
            } else if (terminal.store[RESOURCE_ENERGY] > 14000 && _.sum(creep.room.storage.store) / creep.room.storage.storeCapacity < 0.95) {
                creep.memory.type = RESOURCE_ENERGY
                creep.memory.target = creep.room.storage.id
                creep.memory.status = 'getting'
            } else if (terminal.store[RESOURCE_GHODIUM] && creep.room.nuker && creep.room.nuker.ghodium < 5000) {
                creep.memory.type = RESOURCE_GHODIUM
                creep.memory.target = creep.room.nuker.id
                creep.memory.status = 'getting'
            } else {
                creep.suicide()
            }
        }
    }

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
        if (terminal.store[RESOURCE_ENERGY] > 90000 || (!room.controller.isPowerEnabled && terminal.store[RESOURCE_GHODIUM] && terminal.store[RESOURCE_GHODIUM] >= 3000 && room.nuker && room.nuker.ghodium < 5000)) {
            room.memory.missions.terminalmanager[room.name] = {
                roomName: room.name,
            }
        }
        if (!room.controller.isPowerEnabled && terminal.store[RESOURCE_POWER] > 1400 && room.storage.store[RESOURCE_ENERGY] / room.storage.storeCapacity > 0.65) {
            room.memory.missions.terminalmanager[room.name] = {
                roomName: room.name,
                capacity: 100,
                role: 'power',
            }
        }
    }
    if(_.size(  room.memory.missions.terminalmanager)==0){
        room.memory.missions.terminalmanager=undefined
    }


}

module.exports = {
    'work': work,
    'born': born,
    'miss': miss
};