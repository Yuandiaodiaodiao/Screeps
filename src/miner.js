function born(spawnnow, creepname, memory) {
    let bodypart = {
        'work': 6,
        'carry': memory.link ? 4 : 1,
        'move': 3
    }
    let bodyparts = require('tools').generatebody(bodypart, spawnnow)
    // console.log(JSON.stringify(bodyparts))
    return spawnnow.spawnCreep(
        bodyparts,
        creepname,
        {
            memory: {
                status: 'going',
                target: memory.target,
                missionid: memory.target,
                container: memory.container,
                link: memory.link,
            }
        }
    )
}

function work(name) {
    let creep = Game.creeps[name]
    if (creep.memory.status == 'going') {
        let target = Game.getObjectById(creep.memory.container)
        let mine = Game.getObjectById(creep.memory.target)
        let link=Game.getObjectById(creep.memory.link)
        if (link) {
            if (creep.pos.getRangeTo(mine) <= 1) {
                if(creep.pos.getRangeTo(link)>1){
                    creep.move(creep.pos.getDirectionTo(link))
                }else{
                    creep.memory.status = 'linking'
                }
            }else{
                creep.moveTo(mine, {reusePath: 10})
            }
        } else if (target) {
            creep.moveTo(target, {reusePath: 10})
            if (creep.pos.getRangeTo(target) == 0) {
                creep.memory.status = 'mining'
            }
        } else {
            target = Game.getObjectById(creep.memory.target)
            // if (!target) console.log(name + 'no mine')
            creep.moveTo(target)
            if (creep.pos.getRangeTo(target) <= 1) {
                creep.memory.status = 'dropping'
            }
        }
    } else if (creep.memory.status == 'mining') {
        let target = Game.getObjectById(creep.memory.target)
        let container = Game.getObjectById(creep.memory.container)
        // console.log(JSON.stringify(creep.memory))
        if (container.hits < container.hitsMax && creep.carry.energy > 0) {
            creep.repair(container)
        } else {
            if (target.energy > 0) {
                let action = creep.harvest(target)
                if (action == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target)
                } else if (action == ERR_NO_BODYPART) {
                    creep.suicide()
                }
            }
        }
    } else if (creep.memory.status == 'linking') {
        let link = Game.getObjectById(creep.memory.link)
        let target = Game.getObjectById(creep.memory.target)
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
        }
    } else if (creep.memory.status == 'dropping') {
        let target = creep.pos.findInRange(FIND_CONSTRUCTION_SITES, 3, {
            filter: obj => obj.structureType == STRUCTURE_CONTAINER
        })
        if (target.length > 0) {
            if (creep.carry.energy / creep.carryCapacity > 0.85 && target.length > 0) {
                creep.build(target[0])
            } else {
                let target = Game.getObjectById(creep.memory.target)
                if (creep.harvest(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target)
                }
            }
        } else if (creep.pos.findInRange(FIND_STRUCTURES, 3, {
            filter: obj => obj.structureType == STRUCTURE_CONTAINER
        }).length > 0) {
            creep.memory.status = 'going'
            creep.memory.container = creep.pos.findInRange(FIND_STRUCTURES, 3, {
                filter: obj => obj.structureType == STRUCTURE_CONTAINER
            })[0].id
        }

    }
}

module.exports = {
    'work': work,
    'born': born
};