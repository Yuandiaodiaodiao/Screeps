function work(creep) {
    if (!creep.memory.status) return
    else if (creep.memory.status == 'going') {
        if (creep.pos.roomName != creep.memory.missionid) {
            creep.moveTo(new RoomPosition(25, 25, creep.memory.missionid))
        } else {
            creep.memory.status = 'arrive'
            if (creep.pos.x <= 1) creep.move(RIGHT)
            else if (creep.pos.x >= 49) creep.move(LEFT)
            else if (creep.pos.y <= 1) creep.move(BOTTOM)
            else if (creep.pos.y >= 49) creep.move(TOP)
        }
    } else if (creep.memory.status == 'arrive') {
        if (creep.pos.findInRange(STRUCTURE_ROAD, 1) > 0) {
            creep.move(require('tools').randomNum(1, 8))
        } else if (creep.pos.roomName != creep.memory.missionid) {
            creep.memory.status = 'going'
        } else {
            creep.memory.status = undefined
        }
    }

}

function born(spawnnow, creepname, memory) {
    return spawnnow.spawnCreep(
        [MOVE],
        creepname,
        {
            memory: {
                status: 'going',
                missionid: memory.roomName
            }
        }
    )
}


module.exports = {
    'work': work,
    'born': born
};