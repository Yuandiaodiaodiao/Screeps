function work(creep) {
    let room = Game.rooms[creep.memory.missionid]
    if (room) {
        if (creep.reserveController(room.controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(room.controller)
        }
        // if(creep.room.controller.sign.username!='Yuandiaodiaodiao'){
        //     creep.signController(creep.room.controller,'☕')
        // }

    }
}

function born(spawnnow, creepname, memory) {
    const room = Game.rooms[memory.roomName]
    if (!room) return -11
    const controller = Game.rooms[memory.roomName].controller
    let body = {
        'claim': 8,
        'move': 8
    }
    try {
        let bodypart = require('tools').generatebody(body, spawnnow)
        let num = 0
        for (let bd of bodypart) {
            if (bd == 'claim') num++
        }
        if (!controller.reservation
            || controller.reservation.ticksToEnd <= 5000 - Math.max(0, (num - 1)) * 600) {

            return spawnnow.spawnCreep(
                bodypart,
                creepname,
                {
                    memory: {
                        status: 'going',
                        missionid: memory.roomName
                    }
                }
            )
        } else {
            return -11
        }
    } catch (e) {
        console.log(creepname + ' born err' + e)
    }


}

module.exports = {
    'work': work,
    'born': born
};