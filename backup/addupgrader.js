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
    if (creep.carry.energy >= creep.carryCapacity) {
        creep.memory.status = 'upgrading';
    }
    if (creep.memory.status == 'upgrading') {
        let target = Game.getObjectById(creep.memory.missionid)
        let link = null
        let action = creep.upgradeController(target)
        if (action == ERR_NOT_IN_RANGE) {
            creep.moveTo(target)
        } else if (action == ERR_NOT_ENOUGH_RESOURCES) {
            creep.memory.status = 'getting'
        }
    }
    if (creep.memory.status == 'getting') {
        let target = creep.room.storage
        if (target) {
            if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target)
            }
        }
    }
}

function born(spawnnow, creepname, memory) {
    let body = {
        'work': 9,
        'carry': 9,
        'move': 9
    }
    let bodyarray = require('../src/tools').generatebody(body, spawnnow)
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