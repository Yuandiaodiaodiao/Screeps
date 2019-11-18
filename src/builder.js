function getting(creep) {
    let room = Game.rooms[creep.memory.missionid]
    let target = room.storage
    if (target && target.store[RESOURCE_ENERGY] > 1e5) {
        const act = creep.withdraw(target, RESOURCE_ENERGY)
        if (act == ERR_NOT_IN_RANGE) {
            creep.moveTo(target)
            if(Game.time%20==0){
                Game.memory.roomCachettl[creep.pos.roomName] = 0
            }

        } else if (act === OK || act === ERR_FULL) {
            creep.memory.status = 'building'
            creep.carry.energy = 1600
            Game.memory.roomCachettl[creep.pos.roomName] = 0
            building(creep)
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
            creep.memory.status = 'building'
        }
    }

}


function building(creep) {
    let target = Game.getObjectById(creep.memory.buildtarget)
    if (target) {
        const act = creep.build(target)
        if (act == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, {reusePath: 10})
        } else if (act == ERR_NOT_ENOUGH_RESOURCES) {
            creep.memory.status = 'getting'
        } else if (act == ERR_INVALID_TARGET) {
            creep.memory.buildtarget = ""
        } else if (act == OK) {
            if (creep.carry.energy <= creep.getActiveBodyparts('work') * 5) {
                creep.memory.status = 'getting'
                getting(creep)
            }
        }
    } else {
        Game.memory.roomCachettl[creep.pos.roomName] = 0
        let room = Game.rooms[creep.memory.missionid]
        target = require('tools').findrooms(room, FIND_CONSTRUCTION_SITES)[0]
        if (target) {
            creep.memory.buildtarget = target.id
        } else {
            creep.memory.status = 'sleep'
        }
    }

}

function work(creep) {
    //build
    if (creep.memory.status == 'building') {
        building(creep)
    } else if (creep.memory.status == 'getting') {
        getting(creep)
    } else if (creep.memory.status == 'sleep') {
        if (Game.time % 10 == 0) {
            creep.memory.status = 'building'
        }
    }
}


function born(spawnnow, creepname, memory) {

    let body = {
        'work': 24,
        'carry': 9,
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

function miss(room) {
    room.memory.missions.builder = {}
    if (require('tools').findrooms(room, FIND_CONSTRUCTION_SITES).length > 0 && (!(room.storage && room.storage.store[RESOURCE_ENERGY] / room.storage.store.getCapacity() < 0.1))) {
        room.memory.missions.builder[room.name] = {
            roomName: room.name
        }
    } else {
        room.memory.missions.builder = undefined
    }
}

module.exports = {
    'work': work,
    'born': born,
    'miss': miss,
};