function work(name) {
    let creep = Game.creeps[name]
    let room=Game.rooms[creep.memory.roomName]
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
    let body = {
        'claim': 5,
        'move': 5
    }
    try {
        let bodypart = require('tools').generatebody(body, spawnnow)
        let num=0
        for(let bd of bodypart){
            if(bd=='claim')num++
        }
        // console.log('reserver' + Game.rooms[memory.roomName] + ' ' + Game.rooms[memory.roomName].controller.reservation
        //     + bodypart)
        if(memory.roomName=='E26N43'){
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
        }else

        if (!Game.rooms[memory.roomName] || !Game.rooms[memory.roomName].controller.reservation
            || !Game.rooms[memory.roomName].controller.reservation.ticksToEnd
            || Game.rooms[memory.roomName].controller.reservation.ticksToEnd <= 5000-Math.max(0,(num-1))*600) {

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
        console.log(creepname + ' born err' + e)
    }


}

module.exports = {
    'work': work,
    'born': born
};