function work(creep) {
    const memory = creep.memory
    if (memory.status == 'going') {
        let target = Game.getObjectById(memory.missionid)
        if (creep.pos.getRangeTo(target) > 1) {
            creep.moveTo(target)
        } else {
            memory.status = 'upgrading'
        }
    } else if (memory.status == 'upgrading') {
        let target = Game.getObjectById(memory.missionid)
        let container = Game.getObjectById(memory.container)
        if (!container) {
            container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: obj => obj.structureType == STRUCTURE_CONTAINER
            })
            if (container) memory.container = container.id
        } else if (creep.carry.energy<=40 && container.store.energy > 0) {
            creep.withdraw(container, RESOURCE_ENERGY)
        }
        const action = creep.upgradeController(target)
        if (action == ERR_NOT_IN_RANGE) {
            creep.moveTo(target)
        } else if (action == ERR_NOT_ENOUGH_RESOURCES) {
            memory.status = 'getting'
        }
    }
    if (memory.status == 'getting') {
        let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: obj => {
                if (creep.room.controller.level >= 6) {
                    return obj.structureType == STRUCTURE_CONTAINER
                } else {
                    return (obj.structureType == STRUCTURE_LINK && obj.energy > 0)
                        || (obj.structureType == STRUCTURE_TOWER && obj.energy > 0)
                        || (obj.structureType == STRUCTURE_STORAGE && obj.store[RESOURCE_ENERGY] > 5e4)
                        || (obj.structureType == STRUCTURE_CONTAINER && obj.store[RESOURCE_ENERGY] > 1e3)
                }
            }

        })
        if (target) {
            if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target)
            }
        }
        if (creep.carry.energy >= creep.carryCapacity) {
            memory.status = 'upgrading';
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
    }else if(Game.getObjectById(memory.controller).level <=4){
        body={
            'work':16,
            'move':8,
            'carry':12
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
    let role_num_fix = require('main').role_num_fix
    if (room.storage && room.controller.level >= 4) {
        if (room.storage.store[RESOURCE_ENERGY] / room.storage.storeCapacity < 0.4) {
            role_num_fix[room.name].upgrader = 0
        } else if (room.storage.store[RESOURCE_ENERGY] / room.storage.storeCapacity < 0.6) {
            role_num_fix[room.name].upgrader = 1
        } else if (room.storage.store[RESOURCE_ENERGY] / room.storage.storeCapacity < 0.8) {
            role_num_fix[room.name].upgrader = 2
        } else if (room.storage.store[RESOURCE_ENERGY] / room.storage.storeCapacity >= 0.8) {
            role_num_fix[room.name].upgrader = 3
        }
    } else {
        role_num_fix[room.name].upgrader = 1
    }
    if (room.controller.level >= 8) {
        if (role_num_fix[room.name].upgrader >= 2) {
            role_num_fix[room.name].upgrader = 1
        }
    }
    if (room.controller.ticksToDowngrade && room.controller.ticksToDowngrade < 3000 && role_num_fix[room.name].upgrader == 0) {
        role_num_fix[room.name].upgrader = 1
    }

    // if (room.name == 'E29N38') {
    //     console.log('E29N38 upgrader=' + role_num_fix[room.name].upgrader)
    // }
}

module.exports = {
    'work': work,
    'born': born,
    'miss': miss,
};