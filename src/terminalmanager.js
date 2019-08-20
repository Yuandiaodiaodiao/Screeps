function work(name) {
    const creep = Game.creeps[name]
    const terminal = creep.room.terminal
    if (creep.memory.status == 'getting') {
        let act = creep.withdraw(terminal, creep.memory.type)
        if (act == ERR_NOT_IN_RANGE) {
            creep.moveTo(terminal)
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
            creep.moveTo(target)
        } else if (act == OK) {
            if (!creep.carry[creep.memory.type] || creep.carry[creep.memory.type] == 0)
                creep.memory.status = 'miss'
        } else if (act == ERR_NOT_ENOUGH_RESOURCES) {
            creep.memory.status = 'getting'
        }
    } else if (creep.memory.status == 'miss') {
        if (terminal.store[RESOURCE_ENERGY] > 12000 && _.sum(creep.room.storage.store) / creep.room.storage.storeCapacity < 0.95) {
            creep.memory.type = RESOURCE_ENERGY
            creep.memory.target = creep.room.storage.id
            creep.memory.status = 'getting'
        } else if (terminal.store[RESOURCE_POWER]) {
            creep.memory.type = RESOURCE_POWER
            creep.memory.target = creep.room.find(FIND_STRUCTURES, {filter: obj => obj.structureType == STRUCTURE_POWER_SPAWN})[0].id
            creep.memory.status = 'getting'
        }else {
            creep.memory.type=''
        }
    }

}


function born(spawnnow, creepname, memory) {

    let body = {
        'carry': 32,
        'move': 16
    }
    let bodyarray = require('tools').generatebody(body, spawnnow)
    return spawnnow.spawnCreep(
        bodyarray,
        creepname,
        {
            memory: {
                status: 'miss',
                missionid: memory.roomName,
            }
        }
    )
}

module.exports = {
    'work': work,
    'born': born
};