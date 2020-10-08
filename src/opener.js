function statusmiss(creep) {
    creep.memory.status = 'miss'
    if (creep.carry.energy !== 0) {
        let target = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: obj => obj.structureType === STRUCTURE_TOWER && obj.energy / obj.energyCapacity < 0.8})
        if (target) creep.memory.status = 'filltower'
        else if (!creep.room.storage && creep.room.energyAvailable < creep.room.energyCapacityAvailable - 200) {
            creep.memory.status = 'fillextension'
        } else if (creep.room.controller.ticksToDowngrade < 3000) {
            creep.memory.status = 'upgrade'
        } else if (creep.room.controller.level === 8 && creep.room.storage && creep.room.storage.store.energy < 1e6 &&creep.room.terminal) {
            creep.memory.status = 'fill'
        } else {
            creep.memory.status = creep.memory.role
            if (creep.memory.status === 'build') {
                let target = creep.room.find(FIND_CONSTRUCTION_SITES)[0]
                if (!target) {
                    creep.memory.status = 'get'
                }
            }
            if (creep.memory.status === 'get') {
                creep.memory.status = 'upgrade'
            }
        }
    } else {
        creep.memory.status = 'get'
    }
}

function work(creep) {

    if (creep.memory.status === 'solve') {
        if (Game.time % 10 !== 0) return
        const goal = new RoomPosition(...creep.memory.goal)
        let path = []
        let cost = 0
        if (Game.memory.openerCache[creep.pos.roomName] && Game.memory.openerCache[creep.pos.roomName][goal.roomName]) {
            path = Game.memory.openerCache[creep.pos.roomName][goal.roomName]
            cost = path.length
        } else {
            const ans = PathFinder.search(creep.pos, {pos: goal, range: 10}, {
                plainCost: 1,
                swampCost: 5,
                roomCallback: require('tools').roomc_nocreep,
                maxOps: 100000,
                maxCost: 1500,
                maxRooms: 64
            })
            console.log(creep.name + 'solve' + !ans.incomplete)
            if (ans.incomplete) {
                return
            }
            for (let x of ans.path) {
                path.push([x.x, x.y, x.roomName])
            }
            cost = ans.cost
            if (!Game.memory.openerCache[creep.pos.roomName]) {
                Game.memory.openerCache[creep.pos.roomName] = {}
            }
            Game.memory.openerCache[creep.pos.roomName][goal.roomName] = path
        }
        if (!creep.room.memory.missions.opener) {
            creep.suicide()
        }
        creep.room.memory.missions.opener[creep.memory.missionid].cost = cost
        creep.memory.cost = cost
        creep.memory.step = 0
        creep.memory.path = path
        if (creep.getActiveBodyparts(MOVE) < 25) {
            creep.memory.status = 'go'
        } else {
            creep.memory.status = 'beforego'
        }

    } else if (creep.memory.status === 'beforego') {

        creep.moveTo(creep.room.storage, {range: 1})
        let act = creep.withdraw(creep.room.storage, RESOURCE_ENERGY)
        if (act === ERR_FULL) {
            creep.memory.status = 'go'
        }
    } else if (creep.memory.status === 'go') {
        const act = Game.tools.moveByLongPath2(creep.memory.path, creep)
        if (act === OK) {
            statusmiss(creep)
            delete creep.memory.lastMove
            delete creep.memory.path
            delete creep.memory.step
        }
    } else if (creep.memory.status === 'upgrade') {

        let target = creep.room.controller
        let act = creep.upgradeController(target)
        if(creep.room.terminal&& creep.room.terminal.store.energy>1e3){
            creep.memory.status="terminalupgrade"
            return
        }
        if (act === ERR_NOT_IN_RANGE || target.pos.getRangeTo(creep) >= 3) {
            creep.moveTo(target, {ignoreRoads: true, maxCost: 50, maxOps: 500, range: 2, ignoreCreeps: false})
        } else if (act === ERR_NOT_ENOUGH_ENERGY) {
            creep.memory.status = 'get'
        }
        if (creep.room.terminal && creep.store.energy <= creep.getActiveBodyparts('work') * 2) {
            creep.withdraw(creep.room.terminal, RESOURCE_ENERGY)
        }
        if (Game.time % 20 === 0) {
            statusmiss(creep)
            if (creep.memory.status === 'get') {
                creep.memory.status = 'upgrade'
            }
        }

    } else if (creep.memory.status === 'terminalupgrade') {
        let target = creep.room.controller
        let act = creep.upgradeController(target)
        let stayPos
        if(creep.memory.terminalStay){
            stayPos=Game.tools.array2pos(creep.memory.terminalStay)

        }
        if(!creep.memory.terminalStay&&creep.pos.isNearTo(target)){
            //未初始化 但是位置差不多
            creep.memory.terminalStay = Game.tools.pos2array(creep.pos)
            stayPos=target.pos
        }

        if (!creep.memory.terminalStay || !creep.pos.isEqualTo(stayPos)) {
            //正在路上
            let pos = Game.tools.nearavailable(creep.room.terminal.pos, true)
            creep.memory.terminalStay = Game.tools.pos2array(pos)
            stayPos=pos
            creep.moveTo(stayPos)
        }
        if (creep.room.terminal && creep.store.energy <= 50) {
            creep.withdraw(creep.room.terminal, RESOURCE_ENERGY)
        }
        if (Game.time % 20 === 0) {
            statusmiss(creep)
            if (creep.memory.status === 'get') {
                creep.memory.status = 'terminalupgrade'
            }
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
                target = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 1)[0]
                if (target) {
                    creep.pickup(target)
                }
                statusmiss(creep)

            }
        } else {
            target = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 1)[0]
            if (target) {
                creep.pickup(target)
                statusmiss(creep)
            }
            creep.memory.status = 'mine'
            creep.memory.mineTarget = undefined

        }
    } else if (creep.memory.status === 'mine') {
        let target = Game.getObjectById(creep.memory.mineTarget)
        if (target && target.energy > 0) {
            let act = creep.harvest(target)
            if (act === ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {reusePath: 20, ignoreCreeps: false, ignoreRoads: true})
                creep.memory.mineWalk = (creep.memory.mineWalk || 0) + 1
            } else if (act === ERR_FULL || _.sum(creep.carry) === creep.carryCapacity) {
                creep.memory.mineWalk = 0
                creep.memory.status = 'miss'
                creep.memory.mineTarget = undefined
            }
            if (creep.memory.mineWalk && creep.memory.mineWalk > 30) {
                creep.memory.mineWalk = 0
                creep.memory.mineTarget = ''
            }
        } else {
            target = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE, {ignoreCreeps: false, ignoreRoads: true})
            if (target) {
                creep.memory.mineTarget = target.id
            } else {
                statusmiss(creep)

            }
        }

    } else if (creep.memory.status === 'build') {
        build(creep)
    } else if (creep.memory.status === 'fill') {
        let target = creep.room.storage
        if (target && creep.room.controller.level >= 4) {
            let act = creep.transfer(target, RESOURCE_ENERGY)
            if (act == ERR_NOT_IN_RANGE) {
                const pos = Game.tools.nearavailable(target.pos, true)
                creep.moveTo(pos, {ignoreCreeps: false})
            } else if (act === OK) {
                creep.memory.status = 'get'
            } else {
                statusmiss(creep)
            }
            if (Game.time % 20 === 0) {
                statusmiss(creep)
            }
        } else {
            creep.memory.status = 'upgrade'
        }

    } else if (creep.memory.status === 'filltower') {
        let target = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: obj => obj.structureType == STRUCTURE_TOWER && obj.energy / obj.energyCapacity < 0.8})
        if (target && target.energy < target.energyCapacity) {
            const act = creep.transfer(target, RESOURCE_ENERGY)
            if (act == ERR_NOT_IN_RANGE) {
                creep.moveTo(target)
            } else {
                statusmiss(creep)

            }
        } else {
            statusmiss(creep)

        }
    } else if (creep.memory.status === 'fillextension') {
        let target = Game.getObjectById(creep.memory.extensiontarget) || creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: o => (o.structureType === STRUCTURE_EXTENSION || o.structureType === STRUCTURE_SPAWN) && o.store.getFreeCapacity('energy') > 0})
        if (target) {
            const act = creep.transfer(target, RESOURCE_ENERGY)
            if (act === ERR_NOT_IN_RANGE) {
                creep.memory.extensiontarget = target.id
                creep.moveTo(target)
            } else {
                creep.memory.extensiontarget = undefined
                statusmiss(creep)

            }
        } else {
            creep.memory.extensiontarget = undefined
            statusmiss(creep)

        }

    } else if (creep.memory.status === 'miss') {
        statusmiss(creep)

    } else {
        statusmiss(creep)
    }
}


function born(spawnnow, creepname, memory = {}) {

    let body = {
        'work': 15,
        'carry': 10,
        'move': 25
    }
    let tRoom = Game.rooms[memory.roomName]
    if (tRoom && tRoom.controller.level >= 6 && tRoom.terminal) {
        body = {
            'work': 24,
            'carry': 2,
            'move': 24
        }
        if(tRoom.find(FIND_CONSTRUCTION_SITES).length>1){
            body = {
                'work': 10,
                'carry': 15,
                'move': 25
            }
        }
    }

    let bodyparts = require('tools').generatebody(body, spawnnow)
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
    //
    // 'E11N32':{
    // 'E14N41':3
    // }
    // 'W15N32': {
    //     'W5N31': 3
    // }
    'W21N21': {
        'W19N23': 2
    }
}

function miss() {
    for (let helpName in help) {
        let helproom = Game.rooms[helpName]
        if (helproom) {
            if (helproom.storage && helproom.towers.length > 0 && helproom.spawns.length > 0 && helproom.extensions.length >= CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][4]) {
                continue
            }
        }
        for (let fromName in help[helpName]) {
            let room = Game.rooms[fromName]
            let cost = 0
            if (Game.memory.openerCache[fromName] && Game.memory.openerCache[fromName][helpName]) {
                let path = Game.memory.openerCache[fromName][helpName]
                cost = path.length
            }
            room.memory.missions.opener = {}
            room.memory.missions.opener[helpName] = {
                roomName: helpName,
                numfix: helproom.controller.level === 8 ? Math.min(2, help[helpName][fromName]) : help[helpName][fromName],
                cost: cost
            }
        }

    }
}

module.exports = {
    'work': work,
    'born': born,
    'miss': miss,
    'help': help,
    'showCache': showCache
};

function build(creep) {
    let target = Game.getObjectById(creep.memory.buildtarget)
    if (target) {
        const act = creep.build(target)
        if (act === ERR_NOT_IN_RANGE) {
            creep.moveTo(target, {reusePath: 5, ignoreRoads: true, ignoreCreeps: false})
        } else if (act === ERR_NOT_ENOUGH_RESOURCES) {
            if (Game.time - Game.memory.roomCachettl[creep.pos.roomName] > 20) {
                Game.memory.roomCachettl[creep.pos.roomName] = 0
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

function showCache() {
    let str = ''
    for (let i in Game.memory.openerCache) {
        for (let j in Game.memory.openerCache[i]) {
            str += `from ${i} to ${j}` + '\n'
        }
    }
    console.log(str)
}