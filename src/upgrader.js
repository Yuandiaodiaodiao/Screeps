/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('upgrader');
 * mod.thing == 'a thing'; // true
 */
function work(spawns, name) {
    let creep = Game.creeps[name]
    if (creep.memory.status == 'upgrading') {
        // creep.upgradeController(spawns.room.controller)
        if(creep.upgradeController(spawns.room.controller)==ERR_NOT_IN_RANGE){
            creep.moveTo(spawns.room.controller);
        }
        if (creep.carry.energy == 0) {
            creep.memory.status = 'getting'
        }
    }
    if (creep.memory.status == 'getting') {
        let target = spawns.room.storage
        if (target && target.store[RESOURCE_ENERGY] > 5e4) {
            if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target)
            }
        }
        if (creep.carry.energy >= creep.carryCapacity) {
            creep.memory.status = 'upgrading';
        }
    }
}

module.exports = {
    'work': work
};