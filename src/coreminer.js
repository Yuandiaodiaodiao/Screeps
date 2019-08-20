function born(spawnnow, creepname, memory) {
    let bodyparts = require('tools').generatebody(
        {
            'work': 10,
            'carry':2,
            'move': 5,
        }, spawnnow)
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
    let enemys = creep.room.find(FIND_HOSTILE_CREEPS, {filter: obj => obj.owner.username == 'Invader'})
    if (enemys.length > 0) {
        creep.moveTo(creep.pos.findClosestByPath(FIND_EXIT))
        return
    }
    if (creep.hits < creep.hitsMax) {
        creep.moveTo(creep.pos.findClosestByPath(FIND_EXIT))
        return
    }
    if (creep.memory.status == 'going') {
        if (creep.room.name == pos.roomName && creep.pos.getRangeTo(pos) <= 3) {
            if (!creep.memory.target) {
                creep.memory.target = pos.findClosestByRange(FIND_SOURCES).id
            }
            let target = Game.getObjectById(creep.memory.target)
            let container = null
            if (container = target.pos.findInRange(FIND_STRUCTURES, 3, {filter: obj => obj.structureType == STRUCTURE_CONTAINER})[0]) {
                creep.memory.container = container.id
                creep.memory.status = 'mining'
            } else if (container = target.pos.findInRange(FIND_CONSTRUCTION_SITES, 3, {filter: obj => obj.structureType == STRUCTURE_CONTAINER})[0]) {
                creep.memory.container = container.id
                creep.memory.status = 'dropping'
            }
        } else {
            // creep.moveTo(17,3)
            creep.moveTo(pos)
        }

    } else if (creep.memory.status == 'mining') {

        let target = Game.getObjectById(creep.memory.target)
        let container = Game.getObjectById(creep.memory.container)
        let road = null
        if (container.hits < container.hitsMax && creep.carry.energy > 0) {
            if (creep.repair(container) == ERR_NOT_IN_RANGE) {
                creep.moveTo(container)
            }
            if(creep.pos.getRangeTo(container)>=1)creep.moveTo(container)
        }
        else if( creep.carry.energy > 0 &&(road=creep.pos.findInRange(FIND_STRUCTURES,3,{filter:obj=>obj.hits<obj.hitsMax})[0])) {
            creep.repair(road)
        } else {
            let action = creep.harvest(target)
            if (action == ERR_NOT_IN_RANGE) {
                creep.moveTo(target)
            }
            if (creep.carry.energy / creep.carryCapacity > 0.85) {
                if(creep.transfer(container, RESOURCE_ENERGY)==ERR_NOT_IN_RANGE){
                    creep.moveTo(container)
                }
            }
        }

    } else if (creep.memory.status == 'dropping') {

        let target = Game.getObjectById(creep.memory.container)
        if (target) {
            if (creep.carry.energy / creep.carryCapacity > 0.85) {
                creep.build(target)
            } else {
                let target = Game.getObjectById(creep.memory.target)
                if (creep.harvest(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target)
                }
            }
        }
        if (target = creep.pos.findInRange(FIND_STRUCTURES, 3, {
            filter: obj => obj.structureType == STRUCTURE_CONTAINER
        })[0]) {
            creep.memory.status = 'mining'
            creep.memory.container = target.id
        }
    }

}


module.exports = {
    'work': work,
    'born': born,
};