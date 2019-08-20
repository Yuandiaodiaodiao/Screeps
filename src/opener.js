/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('miner');
 * mod.thing == 'a thing'; // true
 */
function work(name) {
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
    } else if (creep.memory.status == 'mining') {
        let target = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE)
        if (target) {
            if (creep.harvest(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target)
            }
        } else {
            let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: obj => obj.structureType == STRUCTURE_CONTAINER
                    && obj.store[RESOURCE_ENERGY] > 1000
            })
            if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target)
            }

        }

        if (creep.carry.energy >= creep.carryCapacity) {
            creep.memory.status = creep.memory.role
        }
    } else if (creep.memory.status == 'building') {
        let target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, {
            filter: obj => obj.structureType != STRUCTURE_WALL
        })
        if (creep.build(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target)
        }
        if (creep.carry.energy == 0) {
            creep.memory.status = 'mining'
        }
    } else if (creep.memory.status == 'upgrading') {
        let target = creep.room.controller
        if (creep.upgradeController(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target)
        }
        if (creep.carry.energy == 0) {
            creep.memory.status = 'mining'
        }
    }


}

function work2(name) {

    let creep = Game.creeps[name]
    if (creep.memory.status == 'going') {
        let posm = creep.memory.position[creep.memory.step]
        let poss = new RoomPosition(posm[0], posm[1], posm[2])
        creep.moveTo(poss)
        if (creep.pos.getRangeTo(poss) == 0) {
            creep.memory.step++
        }
        if (creep.memory.step == creep.memory.position.length) {
            creep.memory.status = 'goback'
        }
    } else if (creep.memory.status == 'goback') {
        creep.moveTo(new RoomPosition(46, 44, 'E28N46'), {reusePath: 0})
        if (creep.hits == creep.hitsMax) creep.memory.status = 'goto'
    } else if (creep.memory.status == 'goto') {
        // if (creep.hits / creep.hitsMax < 0.85) {
        //     creep.memory.status = 'goback'
        // }
        if (creep.pos.roomName == 'E28N46') {
            creep.moveTo(new RoomPosition(3, 44, 'E29N46'))

            return
        }
        let target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS)
        if (target) {
            if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target)
            }
        } else {
            target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: obj => obj.id == '5d34ac74a57273269a97df7f'
            })
            if (target) {
                if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target)
                }
            }
        }

    } else {
        creep.memory.status = 'goback'
    }

}

function work3(name) {
    let creep = Game.creeps[name]
    if (creep.memory.status == 'going') {
        if (creep.pos.roomName == 'E27N38') {
            creep.memory.status = creep.memory.role
        }
        let posm = creep.memory.position[creep.memory.step]
        let poss = new RoomPosition(posm[0], posm[1], posm[2])
        creep.moveTo(poss)
        if (creep.pos.getRangeTo(poss) == 0) {
            creep.memory.step++
        }
        if (creep.memory.step == creep.memory.position.length) {
            creep.memory.status = 'gets'
        }
    } else if (creep.memory.status == 'gets') {
        let act = creep.withdraw(Game.getObjectById('5d0679623edbdf532d3df58c'), RESOURCE_ENERGY)
        if (act == ERR_NOT_IN_RANGE) {
            creep.moveTo(Game.getObjectById('5d0679623edbdf532d3df58c'))
        }
        if (_.sum(creep.carry) >= creep.carryCapacity) {
            creep.memory.status = 'going2'
        }

    } else if (creep.memory.status == 'going2') {
        if (creep.pos.roomName == 'E27N38') {
            creep.memory.status = creep.memory.role
        } else {
            creep.moveTo(new RoomPosition(25, 25, 'E27N38'))
        }
    } else if (creep.memory.status == 'mining') {
        let target = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE)
        if (target) {
            if (creep.harvest(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target)
            }
        } else {
            let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: obj => obj.structureType == STRUCTURE_CONTAINER
                    && obj.store[RESOURCE_ENERGY] > 1000
            })
            if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target)
            }

        }

        if (creep.carry.energy >= creep.carryCapacity) {
            creep.memory.status = creep.memory.role
        }
    } else if (creep.memory.status == 'building') {
        let target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, {
            filter: obj => obj.structureType != STRUCTURE_WALL
        })
        if (!target) {
            creep.memory.status = 'carrying'
        } else if (creep.build(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target)
        }
        if (creep.carry.energy == 0) {
            creep.memory.status = 'getting'
        }
    } else if (creep.memory.status == 'upgrading') {
        let target = creep.room.controller
        if (creep.upgradeController(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target)
        }
        if (creep.carry.energy == 0) {
            creep.memory.status = 'getting'
        }
    } else if (creep.memory.status == 'getting') {
        if (creep.pos.roomName != 'E27N39') {
            creep.moveTo(creep.pos.findClosestByRange(FIND_EXIT_TOP))
        } else {
            let target = Game.getObjectById('5d19a9746bd885386ae397f3')
            let act = creep.withdraw(target, RESOURCE_HYDROGEN)
            if (act == ERR_NOT_IN_RANGE) {
                creep.moveTo(target)
            }
            if (_.sum(creep.carry) >= creep.carryCapacity) {
                creep.memory.status = 'going2'
            }
        }
    } else if (creep.memory.status == 'carrying') {

        let rarget = Game.getObjectById('5d423dc1b82e1179ccba5781')
        let act = creep.transfer(rarget, RESOURCE_HYDROGEN)
        if (act == ERR_NOT_IN_RANGE) {
            creep.moveTo(rarget)
        }
        if (_.sum(rarget.store) >= rarget.storeCapacity) {
            creep.moveTo(new RoomPosition(22, 20, 'E27N38'))
            if (creep.getActiveBodyparts('work') > 0)
                creep.memory.status = 'building'
        }


        if (_.sum(creep.carry) == 0) {
            creep.memory.status = 'getting'
        }
    }


}

function work4(name) {
    let creep = Game.creeps[name]
    if (creep.memory.status == 'going') {
        creep.moveTo(new RoomPosition(2, 25, 'E27N42'))
        if (creep.pos.getRangeTo(new RoomPosition(2, 25, 'E27N42')) <= 1) {
            creep.memory.status = 'dropping'
        }
    } else if (creep.memory.status == 'dropping') {
        let drop = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {filter: obj => obj.resourceType == RESOURCE_ENERGY && obj.amount > 500})
        if (drop) {
            if (creep.pickup(drop) == ERR_NOT_IN_RANGE)
                creep.moveTo(drop)
        } else {
            creep.memory.status = 'mining'
        }
        if (_.sum(creep.carry) >= creep.carryCapacity) {
            creep.memory.status = creep.memory.role
        }
    } else if (creep.memory.status == 'mining') {
        let target = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE)
        if (target) {
            if (creep.harvest(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target)
            }
        } else {
            let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: obj => obj.structureType == STRUCTURE_CONTAINER
                    && obj.store[RESOURCE_ENERGY] > 1000
            })
            if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target)
            }

        }

        if (creep.carry.energy >= creep.carryCapacity) {
            creep.memory.status = creep.memory.role
        }
    } else if (creep.memory.status == 'building') {
        let target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, {
            filter: obj => obj.structureType != STRUCTURE_WALL
        })
        if (creep.build(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target)
        }
        if (creep.carry.energy == 0) {
            creep.memory.status = 'dropping'
        }
    } else if (creep.memory.status == 'upgrading') {
        let target = creep.room.controller
        if (creep.upgradeController(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target)
        }
        if (creep.carry.energy == 0) {
            creep.memory.status = 'dropping'
        }
    }


}

function work5(name) {
    //claim
    let creep = Game.creeps[name]
    let stor = Game.getObjectById("5c424d090e487152742f3d65")
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
    } else if (creep.memory.status == 'upgrading') {
        let target = creep.room.controller
        let act = creep.upgradeController(target)
        if (act == ERR_NOT_IN_RANGE) {
            creep.moveTo(target)
        } else if (act == ERR_NOT_ENOUGH_ENERGY) {
            creep.memory.status = 'mining'
        }
    } else if (creep.memory.status == 'mining') {
        let target = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE)
        if (target) {
            if (creep.harvest(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target)
            }
        }

        if (creep.carry.energy >= creep.carryCapacity) {
            creep.memory.status = creep.memory.role
        }
    } else if (creep.memory.status == 'building') {
        let target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, {
            filter: obj => obj.structureType != STRUCTURE_WALL
        })
        let act = creep.build(target)
        if (act == ERR_NOT_IN_RANGE) {
            creep.moveTo(target)
        } else if (act == ERR_NOT_ENOUGH_RESOURCES) {
            creep.memory.status = 'mining'
        }
    }else if(creep.memory.status=='filling'){
        let target=creep.room.storage
        if(target){
            let act=creep.transfer(target,RESOURCE_ENERGY)
            if(act==ERR_NOT_IN_RANGE){
                creep.moveTo(target)
            }else if(act==OK){
                creep.memory.status='mining'
            }
        }

    }
}

function born(spawnnow, creepname, memory = {}) {


    let bodyparts = require('tools').generatebody({
        'work': 20,
        'carry': 5,
        'move': 25
    }, spawnnow)
    return spawnnow.spawnCreep(
        bodyparts,
        creepname,
        {
            memory: {
                status: 'going',
                step: 0,
                role: 'filling',
                missionid: spawnnow.room.name,
                position: [
                    [36, 25, 'E25N42'],
                    [22, 43, 'E26N42'],
                    [48, 32, 'E26N41'],
                    [48, 32, 'E27N41'],
                    [48, 13, 'E28N41'],
                    [14, 21, 'E29N41'],
                ]
            }
        }
    )
}


module.exports = {
    'work': work5,
    'born': born
};