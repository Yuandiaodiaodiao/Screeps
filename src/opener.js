function work(creep) {

    if (creep.memory.status == 'solving') {
        let goal = creep.memory.goal
        goal = new RoomPosition(goal[0], goal[1], goal[2])
        let ans = PathFinder.search(creep.pos, {pos: goal, range: 1}, {
            plainCost: 1,
            swampCost: 5,
            roomCallback: require('tools').roomc_nocreep,
            maxOps: 40000,
            maxCost: 1500,
            maxRooms: 64
        })
        creep.memory.cost = ans.cost
        creep.memory.position = []
        creep.memory.step = 0
        for (let a in ans.path) {
            if (a % 20 == 0) {
                creep.memory.position.push([ans.path[a].x, ans.path[a].y, ans.path[a].roomName])
            }
        }
        creep.memory.position.push(creep.memory.goal)
        creep.memory.status = 'going'
    } else if (creep.memory.status == 'going') {
        let pos = creep.memory.position[creep.memory.step]
        pos = new RoomPosition(pos[0], pos[1], pos[2])
        creep.moveTo(pos, {reusePath: 20})
        if (creep.pos.getRangeTo(pos) <= 1) {
            creep.memory.step++
        }
        if (creep.memory.step == creep.memory.position.length) {
            creep.memory.status = creep.memory.role
            delete creep.memory.position
            delete creep.memory.step
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
            let act = creep.harvest(target)
            if (act == ERR_NOT_IN_RANGE) {
                creep.moveTo(target)
            }
        }

        if (creep.carry.energy >= creep.carryCapacity - 12) {
            let target = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: obj => obj.structureType == STRUCTURE_TOWER && obj.energy < obj.energyCapacity})
            if (target) creep.memory.status = 'filltower'
            else if (creep.room.controller.ticksToDowngrade < 3000) {
                creep.memory.status = 'upgrading'
            } else
                creep.memory.status = creep.memory.role
        }
    } else if (creep.memory.status == 'building') {
        let target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, {
            filter: obj => obj.structureType != STRUCTURE_WALL
        })
        if (!target) {
            creep.memory.status = 'filling'
        }
        let act = creep.build(target)
        if (act == ERR_NOT_IN_RANGE) {
            creep.moveTo(target)
        } else if (act == ERR_NOT_ENOUGH_RESOURCES) {
            creep.memory.status = 'mining'
        }
    } else if (creep.memory.status == 'filling') {
        let target = creep.room.storage
        if (target) {
            let act = creep.transfer(target, RESOURCE_ENERGY)
            if (act == ERR_NOT_IN_RANGE) {
                creep.moveTo(target)
            } else if (act == OK) {
                creep.memory.status = 'mining'
            }
        } else {
            creep.memory.status = 'upgrading'
        }

    } else if (creep.memory.status == 'filltower') {
        let target = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: obj => obj.structureType == STRUCTURE_TOWER && obj.energy < obj.energyCapacity})
        if (target && target.energy < target.energyCapacity) {
            const act = creep.transfer(target, RESOURCE_ENERGY)
            if (act == ERR_NOT_IN_RANGE) {
                creep.moveTo(target)
            } else if (act == ERR_NOT_ENOUGH_RESOURCES) {
                creep.memory.status = 'mining'
            } else if (act == ERR_FULL) {
                creep.memory.status = 'mining'
            }
        } else {
            creep.memory.status = 'mining'
        }
    }
}

function born(spawnnow, creepname, memory = {}) {


    let bodyparts = require('tools').generatebody({
        'work': 15,
        'carry': 10,
        'move': 25
    }, spawnnow)
    return spawnnow.spawnCreep(
        bodyparts,
        creepname,
        {
            memory: {
                status: 'solving',
                step: 0,
                role: 'building',
                missionid: spawnnow.room.name,
                goal: [7, 44, 'E19N41'],
                position: []
            }
        }
    )
}


module.exports = {
    'work': work,
    'born': born
};