/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('miner');
 * mod.thing == 'a thing'; // true
 */
function work(name) {
    let goalposition = new RoomPosition(25, 25, 'E27N38')
    let creep = Game.creeps[name]
    if (creep.pos.roomName =="E27N38") {
        creep.claimController(creep.room.controller)
        creep.moveTo(creep.room.controller)
    }else{
        creep.moveTo(goalposition)

    }


}
//require('api).missionspawn(Game.spawns['spawn1'], 'E25N43_claimer_111', {roomName='E27N38'}})
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