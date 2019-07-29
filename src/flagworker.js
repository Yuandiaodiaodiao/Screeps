/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('upgrader');
 * mod.thing == 'a thing'; // true
 */
function getting(room, creep, next_status, baseline = 0) {
    let target = room.storage
    if (target && target.store[RESOURCE_ENERGY] > baseline) {
        if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target)
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
    }
    if (creep.carry.energy >= creep.carryCapacity) {
        creep.memory.status = next_status;
    }
}

function work(name) {
    //build
    let creep = Game.creeps[name]
    let room = Game.rooms[creep.memory.missionid]
    if (creep.memory.status == 'finding') {
        let flags = require('tools').findroomsfilter(room, FIND_FLAGS, {
            filter: obj => obj.name.split('_')[0] == 'fw'
        })
        if (flags.length > 0) {
            let miss = flags[0]
            if (miss.name.split('_')[1] == 'repair') {
                creep.memory.status = 'repairing'
                creep.memory.target = miss.pos.findInRange(FIND_STRUCTURES, 0)[0].id
            }
        }
    }
    if (creep.memory.status == 'repairing') {
        let target = Game.getObjectById(creep.memory.target)
        if (target && target.hits < target.hitsMax) {
            if (creep.repair(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        }
        if (creep.carry.energy == 0) {
            creep.memory.status = 'getting'
        }
    }

    if (creep.memory.status == 'getting') {
        getting(room, creep, 'finding', 4e4)
    }
}


function born(spawnnow, creepname, memory) {

    let body = {
        'work': 4,
        'carry': 8,
        'move': 12
    }
    let bodyarray = require('tools').generatebody(body, spawnnow)
    return spawnnow.spawnCreep(
        bodyarray,
        creepname,
        {
            memory: {
                status: 'finding',
                missionid: memory.roomName,
                target: '1'
            }
        }
    )
}

module.exports = {
    'work': work,
    'born': born
};