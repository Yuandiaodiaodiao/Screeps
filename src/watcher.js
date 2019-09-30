function work(creep) {
    if (!creep.memory.status) return
    if (creep.memory.status == 'going') {
        if (creep.pos.roomName != creep.memory.missionid) {
            creep.moveTo(new RoomPosition(25, 25, creep.memory.missionid), {reusePath: 20, plainCost: 1, swampCost: 5})
        } else {
            if (creep.pos.x <= 1) creep.move(RIGHT)
            else if (creep.pos.x >= 49) creep.move(LEFT)
            else if (creep.pos.y <= 1) creep.move(BOTTOM)
            else if (creep.pos.y >= 49) creep.move(TOP)
            else {
                creep.memory.status = 'arrive'
            }
        }
    } else if (creep.memory.status == 'arrive') {
        if (creep.pos.getRangeTo(creep.room.controller) > 2) {
            creep.moveTo(creep.room.controller, {reusePath: 40, plainCost: 1, swampCost: 5})
        } else if (creep.pos.roomName != creep.memory.missionid) {
            creep.memory.status = 'going'
        } else if (creep.pos.x <= 1) creep.move(RIGHT)
        else if (creep.pos.x >= 49) creep.move(LEFT)
        else if (creep.pos.y <= 1) creep.move(BOTTOM)
        else if (creep.pos.y >= 49) creep.move(TOP)
        else {
            creep.memory.status = undefined
            creep.memory._move = undefined
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