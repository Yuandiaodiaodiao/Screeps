

function work(creep) {
    if(creep.memory.status=='going'){
        creep.moveTo(new RoomPosition(27,15,'E30N36'), {reusePath: 20})
        if(creep.pos.getRangeTo(new RoomPosition(27,15,'E30N36'))<=1){
            creep.memory.status='going2'
            if(creep.memory.return){
                creep.memory.status='getting'
            }
        }
    }else if(creep.memory.status=='going2'){
        creep.moveTo(new RoomPosition(7,48,'E31N37'), {reusePath: 20})
        if(creep.pos.getRangeTo(new RoomPosition(7,48,'E31N37'))<=1){
            creep.memory.status='return'

        }
    }
    else if(creep.memory.status=='getting'){
        let target=creep.room.storage
        let act=creep.withdraw(target,RESOURCE_ENERGY)
        if(act==ERR_NOT_IN_RANGE){
            creep.moveTo(target)
        }else if(act==OK){
            creep.memory.status='going'
            creep.memory.return=false
        }
    }else if(creep.memory.status=='return'){
        const target=Game.getObjectById('5ca0a2d85e5e3714d2d8cfb4')
        let act=creep.transfer(target,RESOURCE_ENERGY)
        if(act==ERR_NOT_IN_RANGE){
            creep.moveTo(target)
        }
        if(creep.carry.energy==0){
            creep.memory.status=='going'
            creep.memory.return=true
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