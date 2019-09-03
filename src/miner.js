function born(spawnnow, creepname, memory) {
    let bodypart = {
        'move': 3,
        'work': 6,
        'carry': memory.link ? 4 : 1,
    }
    let bodyparts = require('tools').generatebody(bodypart, spawnnow)
    return spawnnow.spawnCreep(
        bodyparts,
        creepname,
        {
            memory: {
                status: 'going',
                missionid: memory.target,
                container: memory.container,
                link: memory.link,
            }
        }
    )
}

function work(creep) {
    const memory = creep.memory
    if (memory.status == 'mining') {
        const target = Game.getObjectById(memory.missionid)
        const container = Game.getObjectById(memory.container)
        if (container.hits < container.hitsMax && creep.carry.energy > 6) {
            creep.repair(container)
        } else if (target.energy > 0) {
            const action = creep.harvest(target)
            if (action == ERR_NOT_IN_RANGE) {
                creep.moveTo(target)
            } else if (action == ERR_NO_BODYPART) {
                creep.suicide()
            }
        } else {
            memory.sleep = target.ticksToRegeneration || 0
            memory.status = 'sleep'
            memory.temp = memory.status
        }
    } else if (memory.status == 'linking') {
        const link = Game.getObjectById(memory.link)
        const target = Game.getObjectById(memory.missionid)
        if (target.energy > 0) {
            const act = creep.harvest(target)
            if (act == ERR_NOT_IN_RANGE) {
                creep.moveTo(target)
            }
            if (creep.carryCapacity - creep.carry.energy <= 12) {
                const act = creep.transfer(link, RESOURCE_ENERGY)
                if (act == ERR_NOT_IN_RANGE) {
                    creep.moveTo(link)
                }
            }
        } else {
            memory.sleep = target.ticksToRegeneration || 0
            memory.temp = memory.status
            memory.status = 'sleep'
        }
    } else if (memory.status == 'sleep') {
        if (--memory.sleep <= 0) {
            memory.status = memory.temp

            if (memory.status == 'sleep') {
                memory.status = 'going'
            }
            memory.temp = undefined
            memory.sleep = undefined
        }
    } else if (memory.status == 'dropping') {
        let container = Game.getObjectById(memory.container) || creep.pos.findInRange(FIND_CONSTRUCTION_SITES, 3, {
            filter: obj => obj.structureType == STRUCTURE_CONTAINER
        })[0]
        if (container) {
            memory.container = memory.container || container.id
            if (creep.carry.energy / creep.carryCapacity > 0.85) {
                creep.build(container)
            } else {
                const target = Game.getObjectById(memory.missionid)
                const action = creep.harvest(target)
                if (action == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target)
                } else if (action == ERR_NO_BODYPART) {
                    creep.suicide()
                }
            }
        } else if (container = creep.pos.findInRange(FIND_STRUCTURES, 3, {
            filter: obj => obj.structureType == STRUCTURE_CONTAINER
        })[0]) {
            memory.status = 'mining'
            memory.container = container.id
        }
    } else if (memory.status == 'going') {
        if (Game.getObjectById(memory.link)) {
            const link = Game.getObjectById(memory.link)
            const mine = Game.getObjectById(memory.missionid)
            if (creep.pos.getRangeTo(mine) > 1) {
                creep.moveTo(mine, {reusePath: 10})
            } else if (creep.pos.getRangeTo(link) > 1) {
                creep.move(creep.pos.getDirectionTo(link))
            } else {
                memory.status = 'linking'
            }
        } else if (Game.getObjectById(memory.container)) {
            const container = Game.getObjectById(memory.container)
            creep.moveTo(container, {reusePath: 10})
            if (creep.pos.getRangeTo(container) == 0) {
                memory.status = 'mining'
            }
        } else {
            const mine = Game.getObjectById(memory.missionid)
            creep.moveTo(mine)
            if (creep.pos.getRangeTo(mine) <= 1) {
                memory.status = 'dropping'
            }
        }
    }
}

module.exports = {
    'work': work,
    'born': born
};