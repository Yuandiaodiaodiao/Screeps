/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('miner');
 * mod.thing == 'a thing'; // true
 */
function work(name) {
    let goalposition = new RoomPosition(40, 9, 'E28N46')
    let creep = Game.creeps[name]
    let flag=creep.pos.findClosestByPath(FIND_FLAGS)
    creep.moveTo(flag)
    if(creep.pos.getRangeTo(flag)==0){
        flag.remove()
    }

    if (creep.pos.roomName == goalposition.roomName) {
        creep.claimController(creep.room.controller)
    }


}

function born(spawnnow, creepname, memory={}) {
    return spawnnow.spawnCreep(
        [
            TOUGH,TOUGH,TOUGH,TOUGH,
            CLAIM,
            MOVE,MOVE,MOVE,MOVE,MOVE
        ],
        creepname,
        {
            memory: {
                missionid: memory.roomName
            }
        }
    )
}


module.exports = {
    'work': work,
    'born': born
};