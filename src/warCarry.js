function work(creep) {

    if (creep.memory.status === 'pair') {
        if (!creep.memory.pair) {
            const targetCreep = creep.room.find(FIND_MY_CREEPS, {
                filter: o => o.name.split('_')[1] === 'warWall' && o.memory.missionid === creep.memory.missionid
                    && !o.memory.pair
            })[0]
            if (!targetCreep) return
            console.log('targetCreep=' + targetCreep.name)
            if (!targetCreep.memory.pair) {
                targetCreep.memory.pair = creep.id
                creep.memory.pair = targetCreep.id
            }
            creep.memory.status = 'getting'
        } else if (Game.getObjectById(creep.memory.pair).memory.pair === creep.id) {
            creep.memory.status = 'getting'
            console.log('pair error')
        }
    } else if (creep.memory.status === 'going') {
        let targetCreeps = Game.getObjectById(creep.memory.pair)
        if (!targetCreeps) {
            creep.memory.pair = undefined
            creep.memory.status = 'pair'
            return
        }
        if (targetCreeps && !creep.pos.isNearTo(targetCreeps)) {
            creep.moveTo(targetCreeps, {reusePath: 25, maxCost: 254,range:1})
        } else {
            creep.memory.status = 'repair'
        }
    } else if (creep.memory.status === 'repair') {
        let targetCreeps = Game.getObjectById(creep.memory.pair)
        if (!targetCreeps) {
            creep.memory.pair = undefined
            creep.memory.status = 'pair'
            return
        }

        if (targetCreeps && !creep.pos.isNearTo(targetCreeps) ) {
            creep.moveTo(targetCreeps, {reusePath: 10, range: 1})
        } else {
            if (targetCreeps.store.energy < 150) {
                creep.transfer(targetCreeps, 'energy')
            }
        }
        if (creep.store.energy < 150) {
            creep.transfer(targetCreeps, 'energy')
            creep.memory.status = 'getting'
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
            } else if (act === OK || act === ERR_FULL) {
                creep.memory.status = 'going'
                creep.memory.getTarget = undefined
            }
            if (creep.ticksToLive < 30) {
                creep.suicide()
            }
        }

    }

}


function born(spawnnow, creepname, memory) {

    let body = {
        'carry': 33,
        'move': 17
    }
    let bodyarray = require('tools').generatebody(body, spawnnow)
    return spawnnow.spawnCreep(
        bodyarray,
        creepname,
        {
            memory: {
                status: 'pair',
                missionid: memory.roomName,
            }
        }
    )
}


module.exports = {
    'work': work,
    'born': born,
};