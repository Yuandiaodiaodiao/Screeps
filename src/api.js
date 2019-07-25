/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('api');
 * mod.thing == 'a thing'; // true
 */
var testa = "aaa";
var findrooms = require('tools').findrooms

function spawnminer(spawnnow, id) {
    //
    // let unitper = 1;
    // let numb = 0
    // let targets = findrooms(spawnnow.room, FIND_SOURCES)
    // console.log('target'+targets.length)
    // if (targets.length > 0) {
    //     for (let i of range(0, unitper * targets.length)) {
    //         let target = targets[Math.floor(numb / unitper)]
    //         Memory.creeps['m' + i].target = target.id
    //         Memory.creeps['m' + i].container = target.pos.findClosestByRange(FIND_STRUCTURES, {
    //             filter: structure => structure.structureType == STRUCTURE_CONTAINER
    //         }).id
    //         numb++
    //     }
    // }
    let targetid = Memory.rooms[spawnnow.room.name].source[id]
    console.log(targetid)
    if (!Game.getObjectById(targetid)) return
    let containerid = Game.getObjectById(targetid).pos.findClosestByRange(FIND_STRUCTURES, {
        filter: structure => structure.structureType == STRUCTURE_CONTAINER
    }).id
    spawnnow.spawnCreep(
        [WORK, WORK, WORK, WORK, WORK, WORK,
            CARRY, MOVE, MOVE, MOVE],
        'm' + id,
        {
            memory: {
                status: 'going',
                target: targetid,
                container: containerid

            }
        }
    )


}

function spawncarryer(spawnnow, id) {
    spawnnow.spawnCreep(
        [WORK, CARRY, CARRY, CARRY, CARRY,
            CARRY, CARRY, CARRY, CARRY,
            CARRY, CARRY, CARRY, CARRY
            , MOVE, MOVE,
            MOVE, MOVE,
            MOVE, MOVE,
            MOVE
        ],
        'c' + id,
        {
            memory: {
                status: 'getting',
                gettarget: Memory.creeps['m' + id].container
            }
        }
    )
}

function spawnupgrader(name) {
    let body = {
        'work': 12,
        'carry': 2,
        'move': 2
    }
    let bodyarray = []
    for (let part in body) {
        for (let i of range(0, body[part])) {
            bodyarray.push(part)
        }
    }
    Game.spawns['spawn1'].spawnCreep(
        bodyarray,
        name,
        {
            memory: {status: 'getting'}
        }
    )
}

function spawnbuilder(name) {
    Game.spawns['spawn1'].spawnCreep(
        [WORK, WORK, WORK, WORK,
            CARRY, CARRY, CARRY, CARRY,
            CARRY, CARRY, CARRY, CARRY,
            MOVE, MOVE, MOVE, MOVE,
            MOVE, MOVE
        ],
        name,
        {
            memory: {status: 'getting'}
        }
    )
}

function spawn(spawnnow, types, id) {
    if (types == 'm') {
        spawnminer(spawnnow, id)
    } else if (types == 'c') {
        spawncarryer(spawnnow, id)
    } else if (types == 'u') {
        spawnupgrader(types + id)
    } else if (types == 'b') {
        spawnbuilder(types + id)
    } else if (types == 'r') {
        require('reserver').born(spawnnow, id)
    } else if (types == 'f') {
        require('filler').born(spawnnow, id)
    }
}

function missionspawn(spawnnow, types, memory) {
    let creepname = spawnnow.room.name + "_" + types + "_" + Game.time
    let ans = require(types).born(spawnnow, creepname, memory)
    if (ans == OK) console.log('borntype=' + types)
    return ans
}

function* range(beg, end, step = 1) {
    for (let i = beg; i < end; i += step)
        yield i;
}

module.exports = {
    'range': range,
    'testa': testa,
    'spawn': spawn,
    'missionspawn': missionspawn
};
