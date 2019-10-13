function work(creep) {

    if (creep.memory.status === 'solve') {
        if (Game.time % 10 !== 0) return
        const goal = new RoomPosition(...creep.memory.goal)
        const ans = PathFinder.search(creep.pos, {pos: goal, range: 10}, {
            plainCost: 1,
            swampCost: 5,
            roomCallback: require('tools').roomc_nocreep,
            maxOps: 40000,
            maxCost: 1500,
            maxRooms: 64
        })
        console.log(creep.name + 'solve' + !ans.incomplete)
        if (ans.incomplete) {
            return
        }
        const path = []
        for (let x of ans.path) {
            path.push([x.x, x.y, x.roomName])
        }
        creep.memory.cost = ans.cost
        creep.memory.step = 0
        creep.memory.path = path
        creep.memory.status = 'go'
    } else if (creep.memory.status === 'go') {
        const act = Game.tools.moveByLongPath(creep.memory.path, creep)
        if (act === OK) {
            creep.memory.status = 'miss'
            delete creep.memory.path
            delete creep.memory.step
        }
    } else if (creep.memory.status === 'upgrade') {
        let target = creep.room.controller
        let act = creep.upgradeController(target)
        if (act === ERR_NOT_IN_RANGE) {
            creep.moveTo(target, {ignoreRoads: true})
        } else if (act === ERR_NOT_ENOUGH_ENERGY) {
            creep.memory.status = 'get'
        }
    } else if (creep.memory.status === 'get') {
        let target = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: o => o.structureType == STRUCTURE_CONTAINER && o.store.energy > 500})
        if (!target) target = creep.room.terminal
        if (!target || target.store.energy < 500) target = creep.room.storage
        if (target && target.store.energy > 500) {
            const act = creep.withdraw(target, RESOURCE_ENERGY)
            if (act === ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {reusePath: 20, ignoreRoads: true})
            } else {
                creep.memory.status = 'miss'
            }
        } else {
            creep.memory.status = 'mine'
        }
    } else if (creep.memory.status === 'mine') {
        let target = Game.getObjectById(creep.memory.mineTarget)
        if (target&&target.energy>0) {
            let act = creep.harvest(target)
            if (act == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {reusePath: 20, ignoreCreeps: false, ignoreRoads: true})
                creep.memory.mineWalk = (creep.memory.mineWalk || 0) + 1
            } else if (act == ERR_FULL) {
                creep.memory.status = 'miss'
            }
            if (_.sum(creep.carry) === creep.carryCapacity) {
                creep.memory.status='miss'
            }
            if (creep.memory.mineWalk > 30) {
                creep.memory.mineTarget = ''
            }
        } else {
            target = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE, {ignoreCreeps: false, ignoreRoads: true})
            if (target) {
                creep.memory.mineTarget = target.id
            } else {
                creep.memory.status = 'miss'
            }
        }

    } else if (creep.memory.status === 'build') {
        build(creep)
    } else if (creep.memory.status === 'fill') {
        let target = creep.room.storage
        if (target && creep.room.controller.level >= 4) {
            let act = creep.transfer(target, RESOURCE_ENERGY)
            if (act == ERR_NOT_IN_RANGE) {
                creep.moveTo(target)
            } else if (act == OK) {
                creep.memory.status = 'get'
            }
        } else {
            creep.memory.status = 'upgrade'
        }

    } else if (creep.memory.status === 'filltower') {
        let target = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: obj => obj.structureType == STRUCTURE_TOWER && obj.energy / obj.energyCapacity<0.8})
        if (target && target.energy < target.energyCapacity) {
            const act = creep.transfer(target, RESOURCE_ENERGY)
            if (act == ERR_NOT_IN_RANGE) {
                creep.moveTo(target)
            } else {
                creep.memory.status = 'miss'
            }
        } else {
            creep.memory.status = 'miss'
        }
    } else if (creep.memory.status === 'miss') {
        if (creep.carry.energy!==0) {
            let target = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: obj => obj.structureType == STRUCTURE_TOWER && obj.energy / obj.energyCapacity<0.8})
            if (target) creep.memory.status = 'filltower'
            else if (creep.room.controller.ticksToDowngrade < 3000) {
                creep.memory.status = 'upgrade'
            } else {
                creep.memory.status = creep.memory.role
            }
        } else {
            creep.memory.status = 'get'
        }
    } else {
        creep.memory.status = 'miss'
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
                status: 'solve',
                step: 0,
                role: 'build',
                missionid: memory.roomName,
                goal: [25, 25, memory.roomName],
            }
        }
    )
}

let help = {

}

function miss() {
    for (let fromName in help) {
        let helpName = help[fromName]
        let room = Game.rooms[fromName]
        room.memory.missions.opener = {}
        room.memory.missions.opener[helpName] = {
            roomName: helpName
        }
    }
}

module.exports = {
    'work': work,
    'born': born,
    'miss': miss
};

function build(creep) {
    let target = Game.getObjectById(creep.memory.buildtarget)
    if (target) {
        const act = creep.build(target)
        if (act === ERR_NOT_IN_RANGE) {
            creep.moveTo(target, {reusePath: 5, ignoreRoads: true, ignoreCreeps: false})
        } else if (act === ERR_NOT_ENOUGH_RESOURCES) {
            if (Game.time - require('tools').roomCachettl[creep.pos.roomName] > 20) {
                require('tools').roomCachettl[creep.pos.roomName] = 0
            }
            creep.memory.status = 'get'
        } else if (act === ERR_INVALID_TARGET) {
            creep.memory.buildtarget = ""
        }
    } else {
        target = creep.room.find(FIND_CONSTRUCTION_SITES)[0]
        if (target) {
            creep.memory.buildtarget = target.id
        } else {
            creep.memory.status = 'fill'
        }
    }
}