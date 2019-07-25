/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('miner');
 * mod.thing == 'a thing'; // true
 */
function work( name) {
    let creep = Game.creeps[name]
    if (creep.memory.status == 'going') {
        let route = Game.map.findRoute(creep.room, creep.memory.roomName);
        if(route.length > 0) {
            const exit = creep.pos.findClosestByRange(route[0].exit);
            creep.moveTo(exit);
        }
        if(creep.pos.roomName==creep.memory.roomName){
            creep.memory.status='arrive'
            creep.moveTo(25,25)
        }
    }else if(creep.memory.status=='arrive'){
        if(creep.pos.findInRange(STRUCTURE_ROAD,1)>0){
            creep.move(require('tools').randomNum(1,8))
        }
        else if(creep.pos.roomName!=creep.memory.roomName){
            creep.memory.status='going'
        }else{
            creep.memory.status='finish'
        }
    }

}
function born(spawnnow,creepname,memory){
    return spawnnow.spawnCreep(
        [MOVE],
        creepname,
        {
            memory: {
                status: 'going',
                roomName:memory.roomName,
                missionid:memory.roomName
            }
        }
    )
}


module.exports = {
    'work':work,
    'born':born
};