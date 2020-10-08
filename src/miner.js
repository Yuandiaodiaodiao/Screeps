function born(spawnnow, creepname, memory) {
    let bodypart = {
        'move': 3,
        'work': 6,
        'carry': memory.link ? 4 : 1,
    }
    if (spawnnow.room.controller.level >= 5) {
        bodypart = {
            'move': 6,
            'work': 12,
            'carry': memory.link ? 8 : 1,
        }
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
        if (container.hits < container.hitsMax && creep.carry.energy > 12) {
            creep.repair(container)
        } else if (target.energy > 0 && container.store.energy < 1976) {
            const action = creep.harvest(target)
            if (action == ERR_NOT_IN_RANGE) {
                creep.moveTo(target)
            } else if (action == ERR_NO_BODYPART) {
                creep.suicide()
            } else if (!creep.pos.isEqualTo(container)) {
                creep.moveTo(container)
            }
        } else if (target.energy == 0) {
            memory.sleep = target.ticksToRegeneration || 0
            memory.status = 'sleep'
        }
    } else if (memory.status === 'linking') {
        const link = Game.getObjectById(memory.link)
        const target = Game.getObjectById(memory.missionid)
        if (target.energy > 0) {
            if (creep.carryCapacity - creep.carry.energy > 0) {
                const act = creep.harvest(target)
                if (act === ERR_NOT_IN_RANGE) {

                    creep.moveTo(Game.tools.middleOfTwo(target.pos, link.pos))
                }
            }

            if (creep.carryCapacity - creep.carry.energy <= 24) {
                const act = creep.transfer(link, RESOURCE_ENERGY)
                if (act == ERR_NOT_IN_RANGE) {
                    creep.moveTo(link)
                }
            }
        } else {
            memory.sleep = target.ticksToRegeneration || 0
            memory.status = 'sleep'
        }
    } else if (memory.status == 'sleep') {
        if (--memory.sleep <= 0 || (Game.time % 10 == 0 && Game.getObjectById(memory.missionid).energy > 0)) {
            memory.status = memory.link ? 'linking' : memory.container ? 'mining' : 'dropping'
            memory.sleep = undefined
            memory._move = undefined
        }

    } else if (memory.status == 'dropping') {
        let container = Game.getObjectById(memory.container) || creep.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {
            filter: obj => obj.structureType === STRUCTURE_CONTAINER
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
        } else if (container = creep.pos.findInRange(FIND_STRUCTURES, 1, {
            filter: obj => obj.structureType == STRUCTURE_CONTAINER
        })[0]) {
            memory.status = 'mining'
            require('main').handlemission(creep.room.name)
            memory.container = container.id
        } else {
            creep.room.createConstructionSite(creep.pos, STRUCTURE_CONTAINER)

        }
    } else if (memory.status === 'going') {
        if (memory.link) {
            const link = Game.getObjectById(memory.link)
            const mine = Game.getObjectById(memory.missionid)
            if (creep.pos.getRangeTo(mine) > 1 || creep.pos.getRangeTo(link) > 1) {
                creep.moveTo(Game.tools.middleOfTwo(mine.pos, link.pos))
            } else {
                memory.status = 'linking'
            }
        } else if (memory.container) {
            const container = Game.getObjectById(memory.container)
            creep.moveTo(container, {reusePath: 50, range: 0})
            if (creep.pos.isEqualTo(container)) {
                memory.status = 'mining'
            }
        } else {
            const mine = Game.getObjectById(memory.missionid)
            creep.moveTo(mine, {reusePath: 50, range: 1})
            if (creep.pos.isNearTo(mine)) {
                memory.status = 'dropping'
            }
        }
    }
}

module.exports = {
    'work': work,
    'born': born
};