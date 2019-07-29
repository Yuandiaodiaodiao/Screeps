function born(spawnnow, creepname, memory) {
    if (spawnnow.room.name != 'E28N46') return -11
    let bodyparts = require('tools').generatebody({
        'heal': 40,
        'move': 20,
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

//require('healer').tough()
function tough() {
    Game.spawns['E28N46_spawn1'].spawnCreep(
        require('tools').generatebody({
            'tough': 20,
            'move': 10,
            'heal': 1
        }),
        'toughx'
    )
}

function work(name) {
    let tou = Game.creeps['toughx']
    if (tou) {
        tou.moveTo(new RoomPosition(3, 45, 'E29N46'))
    }
    let creep = Game.creeps[name]
    if (creep.memory.status == 'going') {
        creep.moveTo(new RoomPosition(47, 45, 'E28N46'))
        if (creep.pos.findClosestByRange(FIND_FLAGS, {filter: obj => obj.name == 'a'})) {
            creep.memory.status = 'goto'
        }
    } else if (creep.memory.status == 'goto') {
        let target = creep.pos.findInRange(FIND_MY_CREEPS, 5, {filter: obj => obj.hits < obj.hitsMax}).sort(
            (a, b) => {
                if (a.body.indexOf('heal') && b.body.indexOf('heal')) {
                    return a.hits / a.hitsMax - b.hits / b.hitsMax
                } else if (a.body.indexOf('heal')) {
                    return -1
                } else if (b.body.indexOf('heal')) {
                    return 1
                } else {
                    return a.hits / a.hitsMax - b.hits / b.hitsMax
                }
            }
        )[0]
        if (target) {
            if (creep.heal(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {reusePath: 0})
                creep.rangedHeal(target)
            }

        } else {
            if (creep.hits < creep.hitsMax) {
                creep.heal(creep)
            } else {
                creep.moveTo(new RoomPosition(3, 46, 'E29N46'), {reusePath: 0})

            }
        }
        if (creep.pos.findClosestByRange(FIND_FLAGS, {filter: obj => obj.name == 'lv'})) {
            creep.memory.status = 'goback'
        }

    }
    if (creep.memory.status == 'goback') {
        if (creep.pos.findClosestByRange(FIND_FLAGS, {filter: obj => obj.name == 'a'})) {
            creep.memory.status = 'goto'
        }
        if (tou) {
            tou.moveTo(new RoomPosition(44, 44, 'E28N46'), {reusePath: 0})
        }
        creep.moveTo(new RoomPosition(44, 44, 'E28N46'), {reusePath: 0})
        let target = creep.pos.findInRange(FIND_MY_CREEPS, 5, {filter: obj => obj.hits < obj.hitsMax}).sort(
            (a, b) => {
                if (a.body.indexOf('heal') && b.body.indexOf('heal')) {
                    return a.hits / a.hitsMax - b.hits / b.hitsMax
                } else if (a.body.indexOf('heal')) {
                    return -1
                } else if (b.body.indexOf('heal')) {
                    return 1
                } else {
                    return a.hits / a.hitsMax - b.hits / b.hitsMax
                }
            }
        )[0]
        if (target) {
            if (creep.heal(target) == ERR_NOT_IN_RANGE) {
                creep.rangedHeal(target)
            }

        } else {
            if (creep.hits < creep.hitsMax) {
                creep.heal(creep)
            }
        }

    }

}

function work2(name) {

    let creep = Game.creeps[name]
    if(creep.hits<creep.hitsMax){
        creep.moveTo(new RoomPosition(44, 44, 'E28N46'))
        creep.heal(creep)
        return
    }
    if (creep.memory.status == 'going') {
        creep.moveTo(new RoomPosition(44, 44, 'E28N46'))
        if (creep.pos.getRangeTo(new RoomPosition(44, 44, 'E28N46')) == 1) {
            creep.memory.status = 'heal'
        }
    } else if (creep.memory.status == 'heal') {
        let target = creep.pos.findClosestByPath(FIND_MY_CREEPS, {filter: obj => obj.hits < obj.hitsMax})
        if (target) {
            if (creep.heal(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {reusePath: 0})
                creep.rangedHeal(target)
            }
        } else {
            if (creep.hits < creep.hitsMax) {
                creep.heal(creep)
            } else {
                creep.moveTo(new RoomPosition(44, 44, 'E28N46')), {reusePath: 0}

            }
        }


    }
    else{
        creep.memory.status='going'
    }

}

module.exports = {
    'work': work2,
    'born': born,
    'tough': tough
};