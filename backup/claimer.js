
function work(creep) {
    let goalposition = new RoomPosition(25, 25, 'E27N38')
    if (creep.pos.roomName =="E27N38") {
        creep.claimController(creep.room.controller)
        creep.moveTo(creep.room.controller)
    }else{
        creep.moveTo(goalposition)

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