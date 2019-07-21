/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('tower');
 * mod.thing == 'a thing'; // true
 */

function work(spawnnow,tower){
    let enemy=spawnnow.room.find(FIND_HOSTILE_CREEPS)
    if(enemy.length>0){
        tower.attack(tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS))
    }else if(tower.pos.findInRange(FIND_STRUCTURES,5,{
        filter: obj=> obj.hits<obj.hitsMax
    }).length>0){

        tower.repair(tower.pos.findClosestByRange(FIND_STRUCTURES,{
            filter: obj=> obj.hits<obj.hitsMax
        }))
    }

}

module.exports = {
    'work':work
};