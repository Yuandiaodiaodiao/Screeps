/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('tower');
 * mod.thing == 'a thing'; // true
 */

function work(room) {
    let target = room.find(FIND_HOSTILE_CREEPS)[0]
    let roomenergy = 0
    if (room.storage) {
        roomenergy = room.storage.store[RESOURCE_ENERGY] / room.storage.storeCapacity
    }
    if (target) {
        for (let id of room.memory.tower) {
            let tower = Game.getObjectById(id)
            tower.attack(tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS))
        }
    } else if (target = room.find(FIND_MY_CREEPS,
        {
            filter: obj =>
                obj.hits < obj.hitsMax
        }
    )[0]) {
        for (let id of room.memory.tower) {
            Game.getObjectById(id).heal(target)
        }

    } else if (Game.time % 10 == 0) {
        room.memory.towercache = []
        target = room.find(FIND_STRUCTURES, {
            filter: obj => ((obj.hits < obj.hitsMax
                    && obj.structureType != STRUCTURE_WALL
                    && obj.hits < 1e7)
                || (obj.structureType == STRUCTURE_WALL && obj.hits < 1e5)
            )
        }).sort((a, b) => {
            return (a.hits - b.hits)
        })
        let num = 0
        let target1 = null
        for (let target1 of target) {
            if ((target1.structureType == STRUCTURE_WALL || target1.structureType == STRUCTURE_RAMPART) && roomenergy < 0.5) continue
            room.memory.towercache.push(target1.id)
            num++
            if (num == 10) break
        }
        num = 0
        for (let id of room.memory.tower) {
            if (target1 = target[num]) {
                Game.getObjectById(id).repair(target1)
            }
            num++
        }
    } else {
        try {
            target = room.memory.towercache
            if (target && target.length > 0) {

                for (let id of room.memory.tower) {
                    let target1 = Game.getObjectById(target[0])
                    let num = 0
                    const tower = Game.getObjectById(id)
                    while (target1.hits == target1.hitsMax) {
                        num++
                        if (!(target1 = Game.getObjectById(target[num]))) {
                            break
                        }
                    }
                    if (target1) {
                        tower.repair(target1)
                    }
                }
            }
        } catch (e) {
            console.log('tower cache error' + e)
        }


    }


}

module.exports = {
    'work': work
};