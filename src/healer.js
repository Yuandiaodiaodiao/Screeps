function born(spawnnow, creepname, memory) {
    let bodyparts = require('tools').generatebody({
        // 'ranged_attack': 10,
        // 'heal': 15,
        // 'move': 25,
        //
        'move':1,
    }, spawnnow)
    // console.log(JSON.stringify(bodyparts))
    return spawnnow.spawnCreep(
        bodyparts,
        creepname,
        {
            memory: {
                status: 'solving',
                missionid: memory.roomName,
                step: 0,
                goal: [6, 2, 'E30N40'],
                position: []
            }
        }
    )
}
function roomc(roomName) {

    let room = Game.rooms[roomName];

    if (!room){
        const terrain=Game.map.getRoomTerrain(roomName)
        let costs = new PathFinder.CostMatrix
        for(let y = 0; y < 50; y++) {
            for(let x = 0; x < 50; x++) {
                const tile = terrain.get(x, y);
                const weight =
                    tile === TERRAIN_MASK_WALL  ? 255 : // wall  => unwalkable
                        tile === TERRAIN_MASK_SWAMP ?   5 : // swamp => weight:  5
                            1 ; // plain => weight:  1
                costs.set(x, y, weight);
            }
        }
        return costs
    }
    let costs = new PathFinder.CostMatrix;

    room.find(FIND_STRUCTURES).forEach(function(struct) {
        if (struct.structureType === STRUCTURE_ROAD) {
            // Favor roads over plain tiles
            costs.set(struct.pos.x, struct.pos.y, 1);
        } else if (struct.structureType !== STRUCTURE_CONTAINER &&
            (struct.structureType !== STRUCTURE_RAMPART ||
                !struct.my)) {
            // Can't walk through non-walkable buildings
            costs.set(struct.pos.x, struct.pos.y, 0xff);
        }
    });

    // Avoid creeps in the room
    room.find(FIND_CREEPS).forEach(function(creep) {
        costs.set(creep.pos.x, creep.pos.y, 0xff);
    });

    return costs;
}

function work(name) {
    //rush
    let creep = Game.creeps[name]
    if (creep.memory.status == 'solving') {
        let goal = creep.memory.goal
        goal = new RoomPosition(goal[0], goal[1], goal[2])

        let ans = PathFinder.search(creep.pos, {pos: goal, range: 1},{maxOps:4000, roomCallback:roomc})
        console.log('road ops='+ans.ops)
        console.log('road comp'+ ans.incomplete +'cost'+ans.cost)
        creep.memory.position=[]
        creep.memory.step=0
        for(let a in ans.path){
            if(a%20==0){
                creep.memory.position.push([ans.path[a].x,ans.path[a].y,ans.path[a].roomName])
            }
        }

    creep.memory.status='going'
    }else if(creep.memory)

    // if (creep.hits == creep.hitsMax) {
    //     let healc = creep.pos.findClosestByRange(FIND_MY_CREEPS, {filter: obj => obj.hits < obj.hitsMax})
    //     if (healc && creep.memory.status != 'going')
    //         if (creep.heal(healc) == ERR_NOT_IN_RANGE) {
    //             creep.moveTo(healc)
    //             // return
    //         }
    // } else {
    creep.heal(creep)
    // }


    if (creep.memory.status == 'going') {
        let posm = creep.memory.position[creep.memory.step]
        let poss = new RoomPosition(posm[0], posm[1], posm[2])
        creep.moveTo(poss)
        if (creep.pos.getRangeTo(poss) <= 1) {
            creep.memory.step++
        }
        if (creep.memory.step == creep.memory.position.length) {
            creep.memory.status = 'waiting'
        }
    } else if (creep.memory.status == 'waiting') {
        if (creep.hits / creep.hitsMax < 0.95) {
            if (creep.pos.getRangeTo(new RoomPosition(16, 47, 'E29N39')) > 1) {
                creep.moveTo(new RoomPosition(16, 47, 'E29N39'))
            }
        } else {
            // creep.moveTo(new RoomPosition(25,25,'E29N38'))


            let target = Game.getObjectById('a')
            if (!target) {
                target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
                if (!target) {
                    target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES)
                }
            }

            if (creep.pos.getRangeTo(target) <= 1) {
                creep.rangedMassAttack()
            } else {
                if (creep.rangedAttack(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target)
                }
            }
        }

    }


}

module.exports = {
    'work': work,
    'born': born,
};