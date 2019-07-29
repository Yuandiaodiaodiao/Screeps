function born(spawnnow, creepname, memory) {
    if (spawnnow.room.name != 'E28N46') return -11
    let bodyparts = require('tools').generatebody({
        'attack': 20,
        'move': 20
    }, spawnnow)
    // console.log(JSON.stringify(bodyparts))
    return spawnnow.spawnCreep(
        bodyparts,
        creepname,
        {
            memory: {
                status: 'going',
                missionid: memory.roomName,
            }
        }
    )
}


function work(name) {

    let creep = Game.creeps[name]
    if (creep.memory.status == 'going') {
        creep.moveTo(new RoomPosition(44, 44, 'E28N46'))
        if (creep.pos.findClosestByRange(FIND_FLAGS, {filter: obj => obj.name == 'a'})) {
            creep.memory.status = 'goto'
        }
    } else if (creep.memory.status == 'goto') {
        creep.moveTo(new RoomPosition(4, 44, 'E29N46'), {reusePath: 0})
        let target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
        creep.attack(target)
        if (creep.pos.findClosestByRange(FIND_FLAGS, {filter: obj => obj.name == 'lv'})) {
            creep.memory.status = 'goback'
        }

    }
    if (creep.memory.status == 'goback') {
        if (creep.pos.findClosestByRange(FIND_FLAGS, {filter: obj => obj.name == 'a'})) {
            creep.memory.status = 'goto'
            creep.pos.findClosestByRange(FIND_FLAGS, {filter: obj => obj.name == 'a'}).remove()
        }
        creep.moveTo(new RoomPosition(44, 44, 'E28N46'), {reusePath: 0})
        if (creep.hits == creep.hitsMax) creep.memory.status = 'goto'
    }

}

function work2(name) {

    let creep = Game.creeps[name]

    if (creep.memory.status == 'goback') {
        creep.moveTo(new RoomPosition(46, 44, 'E28N46'), {reusePath: 0})
        if (creep.hits == creep.hitsMax) creep.memory.status = 'goto'
    } else if (creep.memory.status == 'goto') {
        // if (creep.hits / creep.hitsMax < 0.85) {
        //     creep.memory.status = 'goback'
        // }
        if (creep.pos.roomName == 'E28N46') {
            creep.moveTo(new RoomPosition(3, 44, 'E29N46'))

            return
        }
        let target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS)
        if (target) {
            if(creep.attack(target)==ERR_NOT_IN_RANGE){
                creep.moveTo(target)
            }
        } else {
            target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: obj => obj.structureType == STRUCTURE_RAMPART
                ||obj.structureType==STRUCTURE_CONTAINER
                ||obj.structureType==STRUCTURE_WALL
            })
            if (target) {
                if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target)
                }
            }
        }

    } else {
        creep.memory.status = 'goback'
    }


}

module.exports = {
    'work': work2,
    'born': born,
};