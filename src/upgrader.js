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
        if (creep.carry.energy / creep.carryCapacity < 0.5
            && (link = creep.pos.findInRange(FIND_STRUCTURES, 1, {
                filter: obj => obj.structureType == STRUCTURE_LINK
            })[0]) && link.energy > 0) {
            creep.withdraw(link, RESOURCE_ENERGY)
        }
        let action=creep.upgradeController(target)
        if (action == ERR_NOT_IN_RANGE) {
            creep.moveTo(target)
        }else if(action==ERR_NOT_ENOUGH_RESOURCES){
            creep.memory.status = 'getting'
        }
    }
    if (creep.memory.status == 'getting') {
        let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: obj =>
                (obj.structureType == STRUCTURE_LINK && obj.energy > 0)
                || (obj.structureType == STRUCTURE_TOWER && obj.energy > 0)
                || (obj.structureType == STRUCTURE_STORAGE && obj.store[RESOURCE_ENERGY] > 5e4)
                || (obj.structureType == STRUCTURE_CONTAINER && obj.store[RESOURCE_ENERGY] > 1e3)

        })
        if (target) {
            if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target)
            }
        }
    }
}

function born(spawnnow, creepname, memory) {
    let body = {
        'work': 20,
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