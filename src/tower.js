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

    } else if (target = room.find(FIND_STRUCTURES, {
        filter: obj => (obj.hits < obj.hitsMax
            && obj.structureType != STRUCTURE_WALL)
    }).sort((a, b) => {
        return(a.hits-b.hits)
    })) {
        let num=0
        let target1=null
        for (let id of room.memory.tower) {
            if(target1=target[num]){
                Game.getObjectById(id).repair(target1)
            }
            num++
        }
    }


}

module.exports = {
    'work': work
};