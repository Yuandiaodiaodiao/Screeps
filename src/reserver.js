function work(creep) {
    if(!creep.memory.status){
        const room = Game.rooms[creep.memory.missionid]
        const action=creep.reserveController(room.controller)
        if (action== ERR_NOT_IN_RANGE) {
            creep.moveTo(room.controller)
        }
    }else{
        const room = Game.rooms[creep.memory.missionid]
        if(room){
            creep.moveTo(room.controller,{reusePath: 50})
            if(creep.pos.getRangeTo(room.controller)<=1){
                creep.memory.status=undefined
                creep.memory._move=undefined
            }
        }
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
    if(_.size(missions.reserver)==0){
        missions.reserver=undefined
    }
}

module.exports = {
    'work': work,
    'born': born,
    'miss':miss,
};