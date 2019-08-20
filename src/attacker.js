function born(spawnnow, creepname, memory) {
    let bodyparts = require('tools').generatebody({
        'attack': 1,
        'work':24,
        'move': 25,
    }, spawnnow)
    // console.log(JSON.stringify(bodyparts))
    return spawnnow.spawnCreep(
        bodyparts,
        creepname,
        {
            memory: {
                status: 'going',
                missionid: memory.roomName,
                step: 0,
                position: [
                    [12, 4, 'E29N39'],
                    [25, 19, 'E29N38'],
                ]
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
            if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target)
            }
        } else {
            target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: obj => obj.structureType == STRUCTURE_RAMPART
                    || obj.structureType == STRUCTURE_CONTAINER
                    || obj.structureType == STRUCTURE_WALL
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

function work3(name) {
    //路径拆墙
    let creep = Game.creeps[name]

    if (creep.memory.status == 'going') {
        let posm = creep.memory.position[creep.memory.step]
        let poss = new RoomPosition(posm[0], posm[1], posm[2])
        creep.moveTo(poss)
        if (creep.pos.getRangeTo(poss) == 0) {
            creep.memory.step++
        }
        if (creep.memory.step == creep.memory.position.length) {
            creep.memory.status = 'mining'
        }
    } else {
        let target = Game.getObjectById("5c990c8b028033459cac6b42")
        if (!target) {
            target = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: obj => obj.structureType == STRUCTURE_RAMPART})
        }
        let act = creep.dismantle(target)
        if (act == ERR_NOT_IN_RANGE) {
            creep.moveTo(target)
        }
    }


}

function work4(name) {
    //打爆
    let creep = Game.creeps[name]

    if (creep.memory.status == 'going') {
        let posm = creep.memory.position[creep.memory.step]
        let poss = new RoomPosition(posm[0], posm[1], posm[2])
        creep.moveTo(poss)
        if (creep.pos.getRangeTo(poss) == 0) {
            creep.memory.step++
        }
        if (creep.memory.step == creep.memory.position.length) {
            creep.memory.status = 'mining'
        }
    } else {
        let target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
        if (target) {
            let act = creep.attack(target)
            if (act == ERR_NOT_IN_RANGE)
                creep.moveTo(target)
            // creep.moveTo(new RoomPosition(25,25,'E29N38'))
        } else {
            let target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
            if (!target) {
                target = Game.getObjectById('5ce43effb6985640ab4831a6')
                if (creep.getActiveBodyparts('work')) {
                    if (creep.dismantle(target) == ERR_NOT_IN_RANGE) creep.moveTo(target)
                } else {
                    if (creep.attack(target) == ERR_NOT_IN_RANGE) creep.moveTo(target)
                }
            } else {
                if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target)
                }
            }
        }
    }


}

module.exports = {
    'work': work4,
    'born': born,
};