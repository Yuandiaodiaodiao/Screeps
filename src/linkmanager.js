

function work(creep) {
    const memory=creep.memory
    const link = Game.getObjectById(memory.link)
    const container = Game.getObjectById(memory.container)
    const storage = creep.room.storage
    if (memory.status == 'getlink') {
        if (link.energy > 0) {
            let act = creep.withdraw(link, RESOURCE_ENERGY)
            if (act == ERR_NOT_IN_RANGE) {
                creep.moveTo(link)
            } else if (act == ERR_FULL) {
                if (_.sum(container.store) / container.storeCapacity < 0.9) {
                    memory.status = 'fillcontainer'
                } else {
                    memory.status = 'fillstorage'
                }
            }
        }else if(_.sum(container.store) / container.storeCapacity < 0.5){
            memory.status = 'fillcontainer'
        }else if(creep.carry.energy!=0){
            memory.status = 'fillstorage'
        }
    } else if (memory.status == 'getstorage') {
        if(storage.store.energy>1e5){
            const act = creep.withdraw(storage, RESOURCE_ENERGY, Math.min(creep.carryCapacity, (container.storeCapacity - _.sum(container.store))))
            if (act == ERR_NOT_IN_RANGE) {
                creep.moveTo(storage)
            } else if (act == OK) {
                memory.status = 'fillcontainer'
            }
        }else{
            memory.status = 'getlink'
        }
    } else if (memory.status == 'fillstorage') {
        if (_.sum(storage.store) / storage.storeCapacity < 0.95) {
            const act = creep.transfer(storage, RESOURCE_ENERGY)
            if (act == ERR_NOT_IN_RANGE) {
                creep.moveTo(storage)
            } else if (act == OK) {
                memory.status = 'getlink'
            }
        }else{
            memory.status='fillcontainer'
        }
    } else if (memory.status == 'fillcontainer') {
        const act = creep.transfer(container, RESOURCE_ENERGY)
        if (act == ERR_NOT_IN_RANGE) {
            creep.moveTo(container)
        } else if (act == ERR_FULL) {
            memory.status = 'fillstorage'
        } else if (act == OK) {
            if (link.energy > 0) {
                memory.status = 'getlink'
            } else if(creep.carry.energy+container.store[RESOURCE_ENERGY]<container.storeCapacity){
                memory.status = 'getstorage'
            }
        }else if(act==ERR_NOT_ENOUGH_RESOURCES){
            memory.status='getstorage'
        }
    }

}


function born(spawnnow, creepname, memory) {

    let body = {
        'carry': 16,
        'move': 8
    }

    let bodyarray = require('tools').generatebody(body, spawnnow)
    return spawnnow.spawnCreep(
        bodyarray,
        creepname,
        {
            memory: {
                status: 'getlink',
                missionid: memory.roomName,
                link:memory.link,
                container:memory.container
            }
        }
    )
}

module.exports = {
    'work': work,
    'born': born
};