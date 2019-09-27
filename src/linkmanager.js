function work(creep) {
    const memory = creep.memory
    const link = Game.getObjectById(memory.link)
    const container = Game.getObjectById(memory.container)
    const storage = creep.room.storage
    if (memory.status == 'miss') {
        const upgrader = require('main').role_num_fix[creep.pos.roomName].upgrader || require('upgrader').miss(creep.room)
        memory._move = undefined
        if (link.energy > 0) {
            memory.status = 'getlink'
        } else if (container.store.energy / container.storeCapacity < 0.5 && upgrader > 0) {
            memory.status = 'getstorage'
        } else if (creep.carry.energy > 0) {
            memory.status = 'fillstorage'
        } else if (container.store.energy > 0 && upgrader == 0) {
            memory.status = 'getcontainer'
        }
    }
    if (memory.status == 'getcontainer') {
        const act = creep.withdraw(container, RESOURCE_ENERGY)
        if (act == ERR_NOT_IN_RANGE) {
            creep.moveTo(container)
        } else if (act == OK || act == ERR_FULL || act == ERR_NOT_ENOUGH_RESOURCES) {
            memory.status = 'fillstorage'
        }
    } else if (memory.status == 'getlink') {
        const act = creep.withdraw(link, RESOURCE_ENERGY)
        if (act == ERR_NOT_IN_RANGE) {
            creep.moveTo(link)
        } else if (act == OK || act == ERR_FULL) {
            memory.status = 'fillstorage'
        }
    } else if (memory.status == 'getstorage') {
        if (storage.store.energy > 1e5) {
            const act = creep.withdraw(storage, RESOURCE_ENERGY, Math.min(creep.carryCapacity, (container.storeCapacity - _.sum(container.store))))
            if (act == ERR_NOT_IN_RANGE) {
                creep.moveTo(storage)
            } else if (act == OK || act == ERR_FULL) {
                memory.status = 'fillcontainer'
            }
        } else {
            memory.status = 'miss'
        }
    } else if (memory.status == 'fillstorage') {
        if (_.sum(storage.store) / storage.storeCapacity < 0.95) {
            const act = creep.transfer(storage, RESOURCE_ENERGY)
            if (act == ERR_NOT_IN_RANGE) {
                creep.moveTo(storage)
            } else if (act == OK || act == ERR_NOT_ENOUGH_RESOURCES) {
                memory.status = 'miss'
            }
        } else {
            memory.status = 'miss'
        }
    } else if (memory.status == 'fillcontainer') {
        const act = creep.transfer(container, RESOURCE_ENERGY)
        if (act == ERR_NOT_IN_RANGE) {
            creep.moveTo(container)
        } else if (act == OK || act == ERR_FULL || act == ERR_NOT_ENOUGH_RESOURCES) {
            memory.status = 'miss'
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
                link: memory.link,
                container: memory.container
            }
        }
    )
}

module.exports = {
    'work': work,
    'born': born
};