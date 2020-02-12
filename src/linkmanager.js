function work(creep) {
    const memory = creep.memory
    const link = Game.getObjectById(memory.link)
    if (!link) {
        require('main').handlemission(creep.pos.roomName)
        creep.suicide()
    }
    const container = Game.getObjectById(memory.container)
    const storage = creep.room.storage

    if (!(Game.defend.defendRoom.includes(creep.room.name)&&Memory.wallNum[creep.room.name] > 1)) {
        if (memory.status == 'miss') {
            const upgrader = Game.time - (require('upgrader').upgradertime[creep.pos.roomName] || Game.time)
            memory._move = undefined
            if (link.energy > 0) {
                memory.status = 'getlink'
            } else if (container.store.energy <= 1200 && upgrader < 50) {
                memory.status = 'getstorage'
            } else if (creep.carry.energy > 0) {
                memory.status = 'fillstorage'
            } else if (container.store.energy > 0 && upgrader >= 50) {
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
                const act = creep.withdraw(storage, RESOURCE_ENERGY, Math.min(creep.carryCapacity, (container.store.getCapacity() - _.sum(container.store))))
                if (act == ERR_NOT_IN_RANGE) {
                    creep.moveTo(storage)
                } else if (act == OK || act == ERR_FULL) {
                    memory.status = 'fillcontainer'
                    creep.moveTo(storage)
                }
            } else {
                memory.status = 'miss'
            }
        } else if (memory.status == 'fillstorage') {
            if (_.sum(storage.store) / storage.store.getCapacity() < 0.98) {
                const act = creep.transfer(storage, RESOURCE_ENERGY)
                if (act == ERR_NOT_IN_RANGE) {
                    creep.moveTo(storage)
                } else if (act == OK || act == ERR_NOT_ENOUGH_RESOURCES) {
                    memory.status = 'miss'
                }
            } else {
                memory.status = 'miss'
            }
        } else if (memory.status === 'fillcontainer') {
            const act = creep.transfer(container, RESOURCE_ENERGY)
            if (act == ERR_NOT_IN_RANGE) {
                creep.moveTo(container)
            } else if (act == OK || act == ERR_FULL || act == ERR_NOT_ENOUGH_RESOURCES) {
                memory.status = 'miss'
                creep.moveTo(storage)
            }
        }
    } else {
        if (memory.status == 'miss') {
            const upgrader = Game.time - (require('upgrader').upgradertime[creep.pos.roomName] || Game.time)
            memory._move = undefined
            if (link.energy < 750) {
                memory.status = 'getlink'
            } else if (container.store.energy <= 1200 && upgrader < 50) {
                memory.status = 'getstorage'
            } else if (creep.carry.energy > 0) {
                memory.status = 'fillstorage'
            } else if (container.store.energy > 0 && upgrader >= 50) {
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
            const act = creep.withdraw(storage, RESOURCE_ENERGY)
            if (act == ERR_NOT_IN_RANGE) {
                creep.moveTo(storage)
            } else if (act == OK || act == ERR_FULL) {
                memory.status = 'fillstorage'
            }
        } else if (memory.status == 'getstorage') {
            if (storage.store.energy > 1e5) {
                const act = creep.withdraw(storage, RESOURCE_ENERGY, Math.min(creep.carryCapacity, (container.store.getCapacity() - _.sum(container.store))))
                if (act == ERR_NOT_IN_RANGE) {
                    creep.moveTo(storage)
                } else if (act == OK || act == ERR_FULL) {
                    memory.status = 'fillcontainer'
                    creep.moveTo(storage)
                }
            } else {
                memory.status = 'miss'
            }
        } else if (memory.status == 'fillstorage') {
            const act = creep.transfer(link, RESOURCE_ENERGY)
            if (act === ERR_NOT_IN_RANGE) {
                creep.moveTo(link)
            } else if (act === OK || act === ERR_NOT_ENOUGH_RESOURCES) {
                memory.status = 'miss'
            }

        } else if (memory.status === 'fillcontainer') {
            const act = creep.transfer(container, RESOURCE_ENERGY)
            if (act == ERR_NOT_IN_RANGE) {
                creep.moveTo(container)
            } else if (act == OK || act == ERR_FULL || act == ERR_NOT_ENOUGH_RESOURCES) {
                memory.status = 'miss'
                creep.moveTo(storage)
            }
        }


    }


}


function born(spawnnow, creepname, memory) {

    let body = {
        'carry': 16,
        'move': 8
    }
    if (spawnnow.room.controller.level <= 7 && spawnnow.room.controller.level >= 6) {
        body = {
            'carry': 32,
            'move': 16
        }
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