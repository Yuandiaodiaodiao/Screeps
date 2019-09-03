

function work(creep) {
    //claim
    if(creep.memory.status=='going'){
        creep.moveTo(new RoomPosition(23,29,'E29N38'), {reusePath: 20})
        if(creep.pos.getRangeTo(new RoomPosition(23,29,'E29N38'))<=1){
            creep.memory.status='getting'
        }
    }else if(creep.memory.status=='getting'){
        let target=creep.room.storage
        let act=creep.withdraw(target,RESOURCE_OXYGEN)
        if(act==ERR_NOT_IN_RANGE){
            creep.moveTo(target)
        }else if(act==OK){
            creep.memory.status='return'
        }
    }else if(creep.memory.status=='return'){
        const target=Game.getObjectById('5d6e13a7debcf91de559bd01')
        let act=creep.transfer(target,RESOURCE_OXYGEN)
        if(act==ERR_NOT_IN_RANGE){
            creep.moveTo(target)
        }else if(act==OK){
            creep.memory.status='getting'
        }
    }
}

function born(spawnnow, creepname, memory = {}) {


    let bodyparts = require('tools').generatebody({
        'carry': 32,
        'move': 32
    }, spawnnow)
    return spawnnow.spawnCreep(
        bodyparts,
        creepname,
        {
            memory: {
                status: 'getting',
                missionid: spawnnow.room.name,

            }
        }
    )
}


module.exports = {
    'work': work,
    'born': born
};