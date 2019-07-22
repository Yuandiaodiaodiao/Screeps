/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('miner');
 * mod.thing == 'a thing'; // true
 */
function mine(spawns, name) {
    let creep = Game.creeps[name]
    if (creep.memory.status == 'going') {
        let target = Game.getObjectById(creep.memory.container)
        creep.moveTo(target)
        if (creep.pos.getRangeTo(target) == 0) {
            creep.memory.status = 'mining'
        }
    }
    if (creep.memory.status == 'mining') {
        let target = Game.getObjectById(creep.memory.target)
        let container = Game.getObjectById(creep.memory.container)
        if (container.hits < container.hitsMax && creep.carry.energy > 0) {
            creep.repair(container)
        } else {
            creep.harvest(target)
        }

    }
}

module.exports = {
    'mine': mine
};