let safeStruc = [STRUCTURE_ROAD, STRUCTURE_RAMPART, STRUCTURE_WALL, STRUCTURE_LINK]
let towerHelp = {}
let towerHelpTarget = {}

function work(creep) {

    if (creep.carry.energy === 0) {
        creep.memory.status = 'getting'
        if (creep.ticksToLive < 10) {
            creep.suicide()
        }
    }
    if (creep.memory.status === 'sleep') {
        if (Game.time % 10 === 0) {
            creep.memory.status = 'miss'
        }
    } else if (creep.memory.status === 'miss') {
        let nukes = creep.room.find(FIND_NUKES)
        for (let nuke of nukes) {
            let structures = nuke.pos.findInRange(FIND_STRUCTURES, 2, {filter: o => !safeStruc.includes(o.structureType)})
            let protectStruc = structures.find(o => o.pos.lookFor(LOOK_STRUCTURES).every(o => o.hits < (o.pos.isEqualTo(nuke.pos) ? 10.1e6 : 5.1e6)))
            if (protectStruc) {
                let rampart = protectStruc.pos.lookFor(LOOK_STRUCTURES).find(o => o.structureType === STRUCTURE_RAMPART)
                let site = protectStruc.pos.lookFor(LOOK_CONSTRUCTION_SITES).find(o => o.structureType === STRUCTURE_RAMPART)
                if (rampart) {
                    creep.memory.repairtarget = rampart.id
                    creep.memory.status = 'repair'
                } else if (site) {
                    creep.memory.repairtarget = site.id
                    creep.memory.status = 'repair'
                } else {
                    let ans = protectStruc.pos.createConstructionSite(STRUCTURE_RAMPART)
                    if (ans) return
                }
            }
        }
        if (creep.memory.status === 'miss') {
            creep.memory.status = 'sleep'
        }
    } else if (creep.memory.status === 'repair') {
        let target = Game.getObjectById(creep.memory.repairtarget)
        if (target) {
            if (creep.room.storage.store.energy > 100e3) {
                towerHelp[creep.room.name] = Game.time + 10
                towerHelpTarget[creep.room.name] = creep.memory.repairtarget
            }
            let act
            if (target.progress) {
                act = creep.build(target)
            } else {
                if (target.hits > 5.3e6) {
                    if (target.pos.lookFor(LOOK_NUKES).length > 0) {
                        if (target.hits > 10.3e6) {
                            creep.memory.repairtarget = undefined
                        }
                    } else {
                        creep.memory.repairtarget = undefined
                    }
                }
                act = creep.repair(target)
            }
            if (creep.pos.getRangeTo(target.pos) >= 3) {
                creep.moveTo(target)
            }
            if (act === ERR_NOT_ENOUGH_RESOURCES || creep.carry.energy === 0) {
                creep.memory.status = 'getting'
            }
        } else {
            creep.memory.status = 'miss'
        }
    }
    if (creep.memory.status === 'getting') {
        if (!creep.memory.getTarget) {
            let linkavailable = creep.room.links.filter(o => o.store.energy > 400)
            let link = _.min(linkavailable, o => ((o && o.pos) ? o.pos.getRangeTo(creep.pos) : 999))
            let storage = creep.room.terminal.store.energy > 20000 ? creep.room.terminal : creep.room.storage
            let target = _.min([link, storage], o => ((o && o.pos) ? o.pos.getRangeTo(creep.pos) : 999))
            if (target) {
                creep.memory.getTarget = target.id
            }
        }

        if (creep.memory.getTarget) {
            let target = Game.getObjectById(creep.memory.getTarget)
            if (target.store.energy === 0) {
                creep.memory.getTarget = undefined
            }
            const act = creep.withdraw(target, RESOURCE_ENERGY)
            if (act === ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {reusePath: 25})
            } else if (act === OK || act === ERR_FULL) {
                creep.memory.status = 'repair'
                creep.memory.getTarget = undefined
            }
            if (creep.ticksToLive < 5) {
                creep.suicide()
            }
        }
    }

}


function born(spawnnow, creepname, memory) {

    let target = spawnnow.room.find(FIND_NUKES)[0]
    if (!target) return
    const ans = PathFinder.search(spawnnow.room.storage.pos, {pos: target.pos, range: 3}, {
        plainCost: 2,
        swampCost: 10,
        roomCallback: require('tools').roomc_nocreep,
        maxRooms: 1
    })
    if (ans.incomplete) {
        console.log(`${spawnnow.room.name} nukeWorker.born ans.incom=${ans.incomplete} to ${target.pos} path=${JSON.stringify(ans.path)}`)
    }
    const dist = ans.cost
    let bestF = 0
    let bestCarry = 2
    for (let i = 2; i <= 32; ++i) {
        let y = i * 100 / (i * 50 / (33 - i) + dist * 2)
        if (y > bestF) {
            bestF = y
            bestCarry = i
        }
    }
    let workNum = 33 - bestCarry
    let body = {
        'work': workNum,
        'carry': bestCarry,
        'move': 17
    }

    let bodyarray = require('tools').generatebody(body, spawnnow)
    return spawnnow.spawnCreep(
        bodyarray,
        creepname,
        {
            memory: {
                status: 'getting',
                missionid: memory.roomName,
            }
        }
    )
}

function miss(room) {
    const memory = room.memory;
    if (!memory.missions) return
    memory.missions.nukeWall = {}
    if (memory.nukeDefender && memory.nukeDefender.buildTtl < Game.time && memory.nukeDefender.structures) {
        memory.nukeDefender.structures.forEach(o => {
            room.createConstructionSite(new RoomPosition(...o.pos), o.structureType, o.name)
        })
        memory.nukeDefender = undefined
        memory.runAwayTick=undefined
    }
    let nukes = room.find(FIND_NUKES)
    if (nukes.length > 0) {
        let minNuke = _.min(nukes, o => o.timeToLand)
        let dangerousTtl = minNuke.timeToLand
        let dangerousTick = Game.time + dangerousTtl
        memory.runAwayTick = dangerousTick + 1
        if (memory.runAwayTick-Game.time <= 200 && memory.runAwayTick-Game.time>=5) {
            let structures = []
            console.log('catchStruc')
            nukes.forEach(nuke => {
                let strucs = minNuke.pos.findInRange(FIND_STRUCTURES, 2, {filter: o => o.structureType !== STRUCTURE_RAMPART})
                structures = structures.concat(strucs.map(o => {
                    return {pos: [o.pos.x, o.pos.y, o.pos.roomName], structureType: o.structureType, name: o.name}
                }))
            })
            memory.nukeDefender = {}
            memory.nukeDefender.structures = structures
            memory.nukeDefender.buildTtl = memory.runAwayTick
        }
    }


    let canFix = false
    if (room.controller.level >= 6 && room.storage && room.storage.store[RESOURCE_ENERGY] / room.storage.store.getCapacity() > 0.05 && nukes.length > 0) {
        for (let nuke of nukes) {
            let structures = nuke.pos.findInRange(FIND_STRUCTURES, 2, {filter: o => !safeStruc.includes(o.structureType)})
            let protectStruc = structures.find(o => o.pos.lookFor(LOOK_STRUCTURES).every(o => o.hits < (o.pos.isEqualTo(nuke.pos) ? 10.1e6 : 5.1e6)))
            if (protectStruc) {
                let rampart = protectStruc.pos.lookFor(LOOK_STRUCTURES).find(o => o.structureType === STRUCTURE_RAMPART)
                let site = protectStruc.pos.lookFor(LOOK_CONSTRUCTION_SITES).find(o => o.structureType === STRUCTURE_RAMPART)
                if (rampart) {
                    canFix = true
                } else if (site) {
                    canFix = true
                } else {
                    let ans = protectStruc.pos.createConstructionSite(STRUCTURE_RAMPART)
                    if (ans) return
                }
            }
        }
        if (canFix) {
            memory.missions.nukeWall[room.name] = {
                roomName: room.name,
                numfix: 1
            }
        }

    }
    if (!canFix) {
        memory.missions.nukeWall = undefined
    }
}

function pcRunAway(creep) {
    creep.say('🤣run!run!')
    if (creep.room.name === creep.name) {
        let exitDirs = creep.room.find(FIND_EXIT)
        let exit = creep.pos.findClosestByRange(exitDirs)
        creep.moveTo(exit)
    } else {
        Game.war.moveAwayFromSide(creep)
    }
}

module.exports = {
    'pcRunAway': pcRunAway,
    'work': work,
    'born': born,
    'miss': miss,
    'towerHelp': towerHelp,
    'towerHelpTarget': towerHelpTarget
};