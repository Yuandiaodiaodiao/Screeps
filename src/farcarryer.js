

function work(creep) {
    //claim
    if(creep.memory.status=='going'){
        creep.moveTo(new RoomPosition(23,29,'E29N38'), {reusePath: 20})
        if(creep.pos.getRangeTo(new RoomPosition(23,29,'E29N38'))<=1){
            creep.memory.status='getting'
        }
    }else if(creep.memory.status=='getting'){
        let act=creep.withdraw(Game.getObjectById('5cf34f6dc3623d67632a48ac'),RESOURCE_KEANIUM)
        if(act==ERR_NOT_IN_RANGE){
            creep.moveTo(Game.getObjectById('5cf34f6dc3623d67632a48ac'))
        }else if(act==OK){
            creep.memory.status='return'
        }
    }else if(creep.memory.status=='return'){
        let target=Game.getObjectById('5cf34f6dc3623d67632a48ac').room.storage
        let act=creep.transfer(target,RESOURCE_KEANIUM)
        if(act==ERR_NOT_IN_RANGE){
            creep.moveTo(target)
        }else if(act==OK){
            creep.memory.status='getting'
        }
    }
}

function born(spawnnow, creepname, memory = {}) {


    let bodyparts = require('tools').generatebody({
        'carry': 25,
        'move': 25
    }, spawnnow)
    return spawnnow.spawnCreep(
        bodyparts,
        creepname,
        {
            memory: {
                status: 'going',
                missionid: spawnnow.room.name,

            }
        }
    )
}


module.exports = {
    'work': work,
    'born': born
};