function work(name) {
    let creep = Game.creeps[name]
    if (creep.pos.roomName == creep.memory.roomName) {
        if (creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller)
        }
    } else {
        creep.moveTo(new RoomPosition(25, 25, creep.memory.roomName))
    }
}

function born(spawnnow, creepname, memory) {
    let body = {
        'claim': 3,
        'move': 3
    }
    try {
        let bodypart = require('tools').generatebody(body, spawnnow)
        // console.log('reserver' + Game.rooms[memory.roomName] + ' ' + Game.rooms[memory.roomName].controller.reservation
        //     + bodypart)
        if (!Game.rooms[memory.roomName] || !Game.rooms[memory.roomName].controller.reservation
            ||!Game.rooms[memory.roomName].controller.reservation.ticksToEnd
            || Game.rooms[memory.roomName].controller.reservation.ticksToEnd <= 4000) {

            return spawnnow.spawnCreep(
                bodypart,
                creepname,
                {
                    memory: {
                        status: 'going',
                        roomName: memory.roomName,
                        missionid: memory.roomName
                    }
                }
            )
        } else {
            return -11
        }
    } catch (e) {
        console.log(creepname+' born err' + e)
    }


}

module.exports = {
    'work': work,
    'born': born
};