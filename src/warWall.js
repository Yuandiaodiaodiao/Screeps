function work(creep) {

    if (creep.memory.status === 'repair') {
        let target = Game.getObjectById(creep.memory.repairtarget)
        if (Game.time % 10 === 0) {
            let site = creep.pos.findInRange(FIND_CONSTRUCTION_SITES, 3)[0]
            if (site) {
                creep.build(site)
                return
            }
        }
        if (target) {
            const act = creep.repair(target)
            let repairPos = creep.memory.repairPos ? new RoomPosition(...creep.memory.repairPos) : undefined
            if (!repairPos || !creep.pos.isEqualTo(repairPos)) {

                if (!creep.memory.repairPos) {
                    const ans = PathFinder.search(Game.rooms[creep.memory.missionid].storage.pos, {
                        pos: target.pos,
                        range: target.structureType === STRUCTURE_RAMPART ? 1 : 3
                    }, {
                        plainCost: 2,
                        swampCost: 10,
                        roomCallback: require('tools').roomc_nocreep,
                        maxRooms: 1,
                        maxCost: 254
                    })
                    const targetPos = _.last(ans.path) || creep.pos
                    creep.memory.repairPos = [targetPos.x, targetPos.y, targetPos.roomName]
                    repairPos = targetPos
                }
                if (repairPos && repairPos.lookFor(LOOK_CREEPS).length > 0) {

                    let targetPos = Game.tools.nearavailable(repairPos, true) || Game.tools.nearavailable(target.pos, true) || repairPos
                    creep.memory.repairPos = [targetPos.x, targetPos.y, targetPos.roomName]
                    repairPos = targetPos
                }
                if (repairPos)
                    creep.moveTo(repairPos)
            } else if (act === ERR_NOT_ENOUGH_RESOURCES || creep.carry.energy === 0) {
                // if (!creep.memory.pair) {
                //     creep.memory.status = 'getting'
                // }
            } else if (act === ERR_NOT_IN_RANGE) {
                creep.memory.repairPos = undefined
            }
        }
        let pair = Game.getObjectById(creep.memory.pair)
        if (!pair) {
            creep.memory.pair = undefined
        }
    }
    if (creep.memory.status === 'getting') {
        if (!creep.memory.getTarget) {
            let linkavailable = (creep.room.memory.wallLink || []).map(o => Game.getObjectById(o)).filter(o => o.store.energy > 0)
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
            } else if (act === OK) {
                creep.memory.status = 'repair'
                creep.memory.getTarget = undefined
            }

        }

    }

}


function born(spawnnow, creepname, memory) {

    let body = {
        'work': 27,
        'carry': 6,
        'move': 17
    }
    let bodyarray = require('tools').generatebody(body, spawnnow)
    return spawnnow.spawnCreep(
        bodyarray,
        creepname,
        {
            memory: {
                status: 'repair',
                missionid: memory.roomName,
            }
        }
    )
}


module.exports = {
    'work': work,
    'born': born,
};