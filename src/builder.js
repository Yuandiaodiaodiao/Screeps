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
    }else{
        target=creep.pos.findClosestByPath(FIND_STRUCTURES,{
            filter:obj=>obj.structureType==STRUCTURE_CONTAINER
            && obj.store[RESOURCE_ENERGY]>1000
        })
        if(target){
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
    let room=Game.rooms[creep.memory.missionid]
    if (creep.memory.status == 'building') {
        let targets = require('tools').findrooms(room, FIND_CONSTRUCTION_SITES)
        if (targets.length > 0) {
            if (creep.build(targets[targets.length - 1]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[targets.length - 1]);
            }
        } else {
            creep.moveTo(23, 15)
        }

        if (creep.carry.energy == 0) {
            creep.memory.status = 'getting'
        }
    }

    if (creep.memory.status == 'getting') {
        getting(room, creep, 'building', 5e4)
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
    if (require('tools').findrooms(spawnnow.room, FIND_CONSTRUCTION_SITES).length == 0)
        return -10
    let body={
        'work':4,
        'carry':8,
        'move':6
    }
    let bodyarray=require('tools').generatebody(body,spawnnow)
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
    'work2': work2,
    'born': born
};