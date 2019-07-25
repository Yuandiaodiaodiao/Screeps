/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('upgrader');
 * mod.thing == 'a thing'; // true
 */
function work(name) {
    let creep = Game.creeps[name]
    if (creep.memory.status == 'upgrading') {
        let target = Game.getObjectById(creep.memory.missionid)
        if (creep.upgradeController(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
        if (creep.carry.energy == 0) {
            creep.memory.status = 'getting'
        }
    }
    if (creep.memory.status == 'getting') {
        let targets = creep.pos.findInRange(FIND_STRUCTURES, 2, {
            filter: obj => obj.structureType == STRUCTURE_LINK
        })
        if (targets.length > 0 && targets[0].energy > 0) {
            if (creep.withdraw(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0])
            }
        } else {
            let target = creep.room.storage
            if (target && target.store[RESOURCE_ENERGY] > 5e4) {
                if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target)
                }
            } else {
                let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: obj => obj.structureType == STRUCTURE_CONTAINER &&
                        obj.store[RESOURCE_ENERGY] > 1000
                })
                if (target) {
                    if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target)
                    }
                } else {
                    let drop = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
                        filter: obj => obj.resourceType == RESOURCE_ENERGY
                    })
                    if (drop) {
                        if (creep.pickup(drop) == ERR_NOT_IN_RANGE)
                            creep.moveTo(drop)
                    }
                }

            }
        }
        if (creep.carry.energy >= creep.carryCapacity) {
            creep.memory.status = 'upgrading';
        }
    }
}

function born(spawnnow, creepname, memory) {
    let body = {
        'work': 15,
        'carry': 4,
        'move': 2
    }
    let bodyarray = require('tools').generatebody(body, spawnnow)
    return spawnnow.spawnCreep(
        bodyarray,
        creepname,
        {
            memory: {
                status: 'getting',
                missionid: memory.controller
            }
        }
    )
}

module.exports = {
    'work': work,
    'born': born
};