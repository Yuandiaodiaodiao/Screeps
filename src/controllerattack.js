function born(spawnnow, creepname, memory) {
    if (spawnnow.room.name != 'E28N46') return -11
    let bodyparts = require('tools').generatebody({
        'claim': 4,
        'move': 4
    }, spawnnow)
    // console.log(JSON.stringify(bodyparts))
    return spawnnow.spawnCreep(
        bodyparts,
        creepname,
        {
            memory: {
                status: 'goto',
                missionid: memory.roomName,
            }
        }
    )
}


function work(name) {


    let creep = Game.creeps[name]
    if (creep.memory.status == 'goto') {
        if(creep.room.name=='E29N46'){
            let target=creep.room.controller
            if(creep.attackController(target)==ERR_NOT_IN_RANGE){
                creep.moveTo(target)
            }
            // creep.signController(target,"Now it's mine")
        }else{
            creep.moveTo(new RoomPosition(2, 44, 'E29N46'))
        }
    }

}


module.exports = {
    'work': work,
    'born': born,
};