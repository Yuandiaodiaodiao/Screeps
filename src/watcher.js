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
        if(creep.pos.roomName!=creep.memory.roomName){
            creep.moveTo(new RoomPosition(25,25,creep.memory.roomName))
        }
        else if(creep.pos.roomName==creep.memory.roomName){
            creep.memory.status='arrive'
            if(creep.pos.x<=1)creep.move(RIGHT)
            else if(creep.pos.x>=49)creep.move(LEFT)
            else if(creep.pos.y<=1)creep.move(BOTTOM)
            else if(creep.pos.y>=49)creep.move(TOP)
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