var canborn=false
function born(spawnnow, creepname, memory) {
    if(Game.time%1000==0)canborn=true
    if(!canborn)return -11
    let bodyparts = require('tools').generatebody({
        'claim': 25,
        'move': 25
    }, spawnnow)
    // console.log(JSON.stringify(bodyparts))
    let act= spawnnow.spawnCreep(
        bodyparts,
        creepname,
        {
            memory: {
                status: 'going',
                missionid: memory.roomName,
                step:0,
                position:[
                    [48, 40, 'E26N40'],
                    [2, 35, 'E29N40'],
                    [25, 19, 'E29N38'],
                ]
            }
        }
    )
    if(act==OK)canborn=false
    return act
}



function work(name) {
    //claim
    let creep = Game.creeps[name]

    if (creep.memory.status == 'going') {
        let posm = creep.memory.position[creep.memory.step]
        let poss = new RoomPosition(posm[0], posm[1], posm[2])
        creep.moveTo(poss)
        if (creep.pos.getRangeTo(poss) == 0) {
            creep.memory.step++
        }
        if (creep.memory.step == creep.memory.position.length) {
            creep.memory.status = 'mining'
        }
    }else{
        let target =creep.room.controller
        let act = creep.attackController(target)
        if (act == ERR_NOT_IN_RANGE) {
            creep.moveTo(target)
        }
    }
}

module.exports = {
    'work': work,
    'born': born,
};