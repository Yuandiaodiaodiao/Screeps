/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('tower');
 * mod.thing == 'a thing'; // true
 */

function work(spawnnow, tower) {
    let enemy = spawnnow.room.find(FIND_HOSTILE_CREEPS)
    if (enemy.length > 0) {
        tower.attack(tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS))
    } else {
        let targets = tower.room.find(FIND_STRUCTURES, {
            filter: obj => obj.hits < obj.hitsMax
                && obj.structureType != STRUCTURE_WALL

        })
        if (targets.length > 0) {
            tower.repair(targets[0])
        } else {
            let hurtcreeps = tower.room.find(FIND_MY_CREEPS,
                {
                    filter: obj =>
                        obj.hits < obj.hitsMax
                }
            )
            if (hurtcreeps.length > 0) {
                tower.heal(hurtcreeps[0])
            }

        }

    }

}

module.exports = {
    'work': work
};