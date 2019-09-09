
function getting(room, creep, next_status, baseline = 0) {
    let target = room.storage
    if (target && target.store[RESOURCE_ENERGY] > baseline) {
        const act = creep.withdraw(target, RESOURCE_ENERGY)
        if (act == ERR_NOT_IN_RANGE) {
            creep.moveTo(target)
        } else if (act == OK || act == ERR_FULL) {
            creep.memory.status = next_status
        }
    } else {
        target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: obj => obj.structureType == STRUCTURE_CONTAINER
                && obj.store[RESOURCE_ENERGY] > 1000
        })
        if (target) {
            if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target)
            }
        }
        if (creep.carry.energy >= creep.carryCapacity) {
            creep.memory.status = next_status;
        }
    }

}

function work(creep) {
    //build
    let room = Game.rooms[creep.memory.missionid]
    if (creep.memory.status == 'building') {
        let target = Game.getObjectById(creep.memory.buildtarget)
        if (target) {
            const act = creep.build(target)
            if (act == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {reusePath: 10})
            } else if (act == ERR_NOT_ENOUGH_RESOURCES) {
                creep.memory.status = 'getting'
            }
        } else {
            target = require('tools').findrooms(room, FIND_CONSTRUCTION_SITES)[0]
            if (target) {
                creep.memory.buildtarget = target.id
            } else {
                creep.memory.status = 'sleep'
            }
        }

    }
    if (creep.memory.status == 'getting') {
        getting(room, creep, 'building', 4e4)
    }
    if (creep.memory.status == 'sleep') {
        if (Game.time % 10 == 0) {
            creep.memory.status = 'building'
        }
    }
}


function born(spawnnow, creepname, memory) {

    let body = {
        'work': 16,
        'carry': 17,
        'move': 17
    }
    let bodyarray = require('tools').generatebody(body, spawnnow)
    return spawnnow.spawnCreep(
        bodyarray,
        creepname,
        {
            memory: {
                status: 'getting',
                missionid: memory.roomName,
                buildtarget: ''
            }
        }
    )
}
function miss(room){
    room.memory.missions.builder={}
    if (require('tools').findrooms(room, FIND_CONSTRUCTION_SITES).length > 0&&(!(room.storage && room.storage.store[RESOURCE_ENERGY] / room.storage.storeCapacity < 0.1))) {
            room.memory.missions.builder[room.name] = {
                roomName: room.name
            }
    }else{
        room.memory.missions.builder=undefined
    }
}
module.exports = {
    'work': work,
    'born': born,
    'miss':miss,
};