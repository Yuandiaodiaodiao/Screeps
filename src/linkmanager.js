/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('carryer');
 * mod.thing == 'a thing'; // true
 */


function work(name) {
    const creep = Game.creeps[name]
    if (creep.spawning) return
    const link = Game.getObjectById(creep.memory.link)
    if (!link) return
    const container = Game.getObjectById(creep.memory.container)
    if (!container) return
    const storage = Game.getObjectById(creep.memory.storage)
    if (!storage) return
    if (creep.memory.status == 'getlink') {
        if (link.energy > 0) {
            let act = creep.withdraw(link, RESOURCE_ENERGY)
            if (act == ERR_NOT_IN_RANGE) {
                creep.moveTo(link)
            } else if (act == ERR_FULL) {
                if (_.sum(container.store) / container.storeCapacity < 0.9) {
                    creep.memory.status = 'fillcontainer'
                } else {
                    creep.memory.status = 'fillstorage'
                }
            }
        }else if(_.sum(container.store) / container.storeCapacity < 0.5){
            creep.memory.status = 'fillcontainer'
        }else if(creep.carry.energy!=0){
            creep.memory.status = 'fillstorage'
        }
    } else if (creep.memory.status == 'getstorage') {
        if(storage.store.energy>1e5){
            const act = creep.withdraw(storage, RESOURCE_ENERGY, Math.min(creep.carryCapacity, (container.storeCapacity - _.sum(container.store))))
            if (act == ERR_NOT_IN_RANGE) {
                creep.moveTo(storage)
            } else if (act == OK) {
                creep.memory.status = 'fillcontainer'
            }
        }else{
            creep.memory.status = 'getlink'
        }
    } else if (creep.memory.status == 'fillstorage') {
        if (_.sum(storage.store) / storage.storeCapacity < 0.95) {
            const act = creep.transfer(storage, RESOURCE_ENERGY)
            if (act == ERR_NOT_IN_RANGE) {
                creep.moveTo(storage)
            } else if (act == OK) {
                creep.memory.status = 'getlink'
            }
        }else{
            creep.memory.status='fillcontainer'
        }
    } else if (creep.memory.status == 'fillcontainer') {
        const act = creep.transfer(container, RESOURCE_ENERGY)
        if (act == ERR_NOT_IN_RANGE) {
            creep.moveTo(container)
        } else if (act == ERR_FULL) {
            creep.memory.status = 'fillstorage'
        } else if (act == OK) {
            if (link.energy > 0) {
                creep.memory.status = 'getlink'
            } else if(creep.carry.energy+container.store[RESOURCE_ENERGY]<container.storeCapacity){
                creep.memory.status = 'getstorage'
            }
        }else if(act==ERR_NOT_ENOUGH_RESOURCES){
            creep.memory.status='getstorage'
        }
    }

}


function born(spawnnow, creepname, memory) {

    let body = {
        'carry': 16,
        'move': 8
    }
    let bodyarray = require('tools').generatebody(body, spawnnow)
    // console.log(JSON.stringify(bodyarray))
    return spawnnow.spawnCreep(
        bodyarray,
        creepname,
        {
            memory: {
                status: 'getlink',
                missionid: memory.roomName,
                storage:memory.storage,
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