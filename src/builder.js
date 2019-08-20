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
    if (creep.memory.status == 'building') {
        if (!creep.memory.buildtarget || !Game.getObjectById(creep.memory.buildtarget)) {
            const target = require('tools').findrooms(room, FIND_CONSTRUCTION_SITES)[0]
            if (target) {
                creep.memory.buildtarget = target.id
            } else {
                creep.memory.status = 'sleep'
            }
        } else {
            const target = Game.getObjectById(creep.memory.buildtarget)
            const act = creep.build(target)
            if (act == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {reusePath: 10})
            } else if (act == ERR_NOT_ENOUGH_RESOURCES) {
                creep.memory.status = 'getting'
            }
        }
    }
    if (creep.memory.status == 'getting') {
        getting(room, creep, 'building', 4e4)
    }
    if(creep.memory.status=='sleep'){
        if(Game.time%10==0){
            creep.memory.status='building'
        }
    }
}

function work2(spawns, name) {
    //repair
    let creep = Game.creeps[name]
    if (creep.memory.status == 'building') {
        let target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES)
        if (target) {
            if (creep.build(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        } else {
            creep.memory.status = 'repairing'
        }

        if (creep.carry.energy == 0) {
            creep.memory.status = 'getting'
        }
    }
    if (creep.memory.status == 'repairing') {
        let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: object => {
                return object.hits < object.hitsMax
                    && object.structureType != STRUCTURE_WALL
            }
        });
        if (target) {
            if (creep.repair(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        } else {
            creep.status = 'building'
        }
        if (creep.carry.energy == 0) {
            creep.memory.status = 'getting'
        }
    }
    if (creep.memory.status == 'getting') {
        getting(spawns, creep, 'repairing', 5e4)
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
                missionid: memory.roomName
            }
        }
    )
}

module.exports = {
    'work': work,
    'born': born
};