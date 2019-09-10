var canborn = false

function born(spawnnow, creepname, memory) {
    if (Game.time % 1000 == 0) canborn = true
    if (!canborn) return -11
    let bodyparts=null
        bodyparts = require('tools').generatebody({
            'claim': 25,
            'move': 25
        }, spawnnow)


    // console.log(JSON.stringify(bodyparts))
        let act = spawnnow.spawnCreep(
            bodyparts,
            creepname,
            {
                memory: {
                    status: 'solving',
                    missionid: memory.roomName,
                    step: 0,
                    position: [],
                    goal: [27, 34, 'E14N41'],
                }
            }
        )
        if (act == OK) canborn = false
        return act
}


function work(creep) {
    //claim

    if (creep.memory.status == 'solving') {
        let goal = creep.memory.goal
        goal = new RoomPosition(goal[0], goal[1], goal[2])
        let ans = PathFinder.search(creep.pos, {pos: goal, range: 1}, {
            plainCost: 1,
            swampCost: 5,
            roomCallback: require('tools').roomc_nocreep,
            maxOps: 20000,
            maxCost: 1200,
            maxRooms: 32,
        })
        creep.memory.position = []
        creep.memory.step = 0
        for (let a in ans.path) {
            if (a % 20 == 0) {
                creep.memory.position.push([ans.path[a].x, ans.path[a].y, ans.path[a].roomName])
            }
        }
        creep.memory.position.push(creep.memory.goal)
        creep.memory.status = 'going'
    }
    if (creep.memory.status == 'going') {
        let pos = creep.memory.position[creep.memory.step]
        pos = new RoomPosition(pos[0], pos[1], pos[2])
        creep.moveTo(pos, {reusePath: 20})
        if (creep.pos.getRangeTo(pos) <= 1) {
            creep.memory.step++
        }
        if (creep.memory.step == creep.memory.position.length) {
            creep.memory.status = 'attack'
            delete creep.memory.position
            delete creep.memory.step
        }
    } else {
        let target = creep.room.controller
        if (!target.my) {
            let act = creep.attackController(target)
            if (act == ERR_NOT_IN_RANGE) {
                creep.moveTo(target)
            }
        }
        if (!target.owner) {
            creep.claimController(target)
        }
    }
}

module.exports = {
    'work': work,
    'born': born,
};