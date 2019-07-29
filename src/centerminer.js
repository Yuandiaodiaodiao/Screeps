function born(spawnnow, creepname, memory) {
    let bodyparts = require('tools').generatebody(
        {
            'tough': 20,
            'carry': 2,
            'move': 16,
            'attack': 10,
            'heal': 1,
        }, spawnnow)
    bodyparts.push('move')
    // console.log(JSON.stringify(bodyparts))
    return spawnnow.spawnCreep(
        bodyparts,
        creepname,
        {
            memory: {
                status: 'going',
                x: memory.x,
                y: memory.y,
                roomName: memory.roomName,
                missionid: memory.x + memory.y + memory.roomName
            }
        }
    )
}


function work(name) {
    let creep = Game.creeps[name]
    let pos = new RoomPosition(creep.memory.x, creep.memory.y, creep.memory.roomName)
    let skp = null
    if (creep.room.name == pos.roomName) {
        if (!creep.memory.keep) {
            creep.memory.keep = pos.findInRange(FIND_STRUCTURES, 5, {filter: obj => obj.structureType == STRUCTURE_KEEPER_LAIR})[0].id
        }
        skp = Game.getObjectById(creep.memory.keep)
        let heal = null
        let enemys = creep.room.find(FIND_HOSTILE_CREEPS, {filter: obj => obj.owner.username == 'Invader'})
        if (enemys.length > 0) {
            creep.moveTo(creep.pos.findClosestByPath(FIND_EXIT))
            creep.heal(creep)
            return
        }
        let enemy = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 5)[0]
        if (enemy) {
            if (creep.hits / creep.hitsMax < 0.1) {
                creep.moveTo(creep.pos.findClosestByPath(FIND_EXIT))
                creep.heal(creep)
            } else if (creep.attack(enemy) == ERR_NOT_IN_RANGE) {
                creep.moveTo(enemy, {reusePath: 0})
                creep.heal(creep)
            }
            return
        } else if (skp.ticksToSpawn && skp.ticksToSpawn < 20) {
            if (creep.pos.getRangeTo(skp) > 1) {
                creep.moveTo(skp, {reusePath: 0})
            }
            return
        } else if (creep.hits < creep.hitsMax) {
            creep.heal(creep)
            return
        } else if (heal = creep.pos.findClosestByRange(FIND_MY_CREEPS, {filter: obj => obj.hits < obj.hitsMax})) {
            let act = creep.heal(heal)
            if (act == ERR_NOT_IN_RANGE) {
                creep.moveTo(heal)
                creep.rangedHeal(heal)
            }
            return
        }
    }

    if (creep.memory.status == 'going') {
        if (creep.room.name == pos.roomName && creep.pos.getRangeTo(pos) <= 3) {
            creep.memory.status = 'staying'
        } else {
            creep.moveTo(pos)
        }
    } else if (creep.memory.status == 'staying') {

        if (skp && creep.pos.getRangeTo(skp) > 1) {
            creep.moveTo(skp)
        }
        let drop = creep.pos.findInRange(FIND_TOMBSTONES, 2, {
            filter: obj => obj.store.energy > 0
        })[0]
        if (drop) {
            if (creep.withdraw(drop, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(drop)
            }
        }
        if (creep.carry.energy >= creep.carryCapacity) {
            creep.memory.status = 'carrying'
        }
    } else if (creep.memory.status == 'carrying') {
        let cont = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: obj => obj.structureType == STRUCTURE_CONTAINER})
        let act = creep.transfer(cont, RESOURCE_ENERGY)
        if (act == ERR_NOT_IN_RANGE) {
            creep.moveTo(cont)
        } else {
            creep.memory.status = 'staying'
        }
    } else {
        creep.memory.status = 'going'
    }

}


module.exports = {
    'work': work,
    'born': born,
};