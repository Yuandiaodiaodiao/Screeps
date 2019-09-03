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
    let body = {
        'claim': memory.part || 2,
        'move': memory.part || 2
    }
    try {
        let bodypart = require('tools').generatebody(body, spawnnow)
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

    } catch (e) {
        console.log(creepname + ' born err' + e)
    }


}

function miss(room) {
    //分配reserver
    const thisroom = room.memory
    const missions = thisroom.missions
    if (!thisroom.subroom) thisroom.subroom = []
    missions.reserver={}
    for (let subroom of thisroom.subroom) {
        const roomb = Game.rooms[subroom]
        if (!roomb) continue
        const maxparts = Math.min(8, Math.floor(room.energyCapacityAvailable / (600 + 50)))
        if (!roomb.controller.reservation
            || roomb.controller.reservation.ticksToEnd <= 5000 - Math.max(0, (maxparts - 1)) * 600) {

            missions.reserver[subroom] = {
                roomName: subroom,
                part: maxparts,
            }
        }

    }
}

module.exports = {
    'work': work,
    'born': born,
    'miss':miss,
};