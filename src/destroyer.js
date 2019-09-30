function born(spawnnow, creepname, memory) {
    const body = {
        'tough':5,
        'claim': 1,
        'move': 6
    }
    memory.cost=undefined
    const bodyparts = require('tools').generatebody(body, spawnnow)
    return spawnnow.spawnCreep(
        bodyparts,
        creepname,
        {
            memory: {
                status: 'going',
                missionid: memory.targetRoomName,
                step: 0,
                goal: memory.goal,
            }
        }
    )
}


function work(creep) {
    if(Game.flags['go'+creep.memory.missionid]){
        creep.moveTo(Game.flags['go'+creep.memory.missionid].pos)
        return
    }
    if (creep.memory.status == 'going') {
        if (!Memory.army[creep.memory.missionid]) creep.suicide()
        const config = Memory.army[creep.memory.missionid].from[creep.name.split('_')[0]]
        const posx = config.path[creep.memory.step]
        let pos = new RoomPosition(posx[0], posx[1], posx[2])
        if (creep.pos.isEqualTo(pos)) {
            creep.memory.step++
            const posx = config.path[creep.memory.step]
            pos = new RoomPosition(posx[0], posx[1], posx[2])
        }
        if (creep.pos.isNearTo(pos)) {
            creep.memory.step++
            creep.move(creep.pos.getDirectionTo(pos))
        } else {
            creep.moveTo(pos, {plainCost: 1, swampCost: 5, reusePath: 20})
        }
        if (creep.memory.step >= config.path.length - 1) {
            creep.memory.status = 'claim'
            delete creep.memory.step
        }
    } else if (creep.memory.status == 'claim') {
        if (creep.pos.roomName == creep.memory.missionid) {
            const controller = Game.rooms[creep.memory.missionid].controller
            const act = creep.claimController(controller)
            if (act == ERR_NOT_IN_RANGE) {
                creep.moveTo(controller)
            } else if (act == OK) {
                creep.memory.status = 'destroy'
            }else{
                creep.attackController(controller)
            }
        } else if (creep.pos.roomName == creep.memory.goal[2]) {
            const exitDir = Game.map.findExit(creep.room, creep.memory.missionid)
            const exit = creep.pos.findClosestByRange(exitDir)
            creep.moveTo(exit)
        }
    } else if (creep.memory.status == 'destroy') {
        const structs = creep.room.find(FIND_STRUCTURES, {filter: o => o.structureType != STRUCTURE_CONTROLLER})
        structs.forEach(o => o.destroy())
        const structs1 = creep.room.find(FIND_CONSTRUCTION_SITES)
        structs1.forEach(o => o.remove())
        if (structs.length == 0) {
            creep.room.controller.unclaim()
            try {
                Game.war.remove(creep.memory.missionid)
            } catch (e) {
            }
            creep.memory.status = 'suicide'
        }
    } else if (creep.memory.status == 'suicide') {
        const mine = creep.room.find(FIND_MINERALS)[0].mineralType
        const source = creep.room.find(FIND_SOURCES).length
        const terrain = Game.map.getRoomTerrain(creep.room.name)
        let wall = 0
        let swamp = 0
        let plain = 0
        for (let a = 0; a <= 49; ++a) {
            for (let b = 0; b <= 49; ++b) {
                switch (terrain.get(a, b)) {
                    case TERRAIN_MASK_WALL:
                        wall++
                        break;
                    case TERRAIN_MASK_SWAMP:
                        swamp++
                        break;
                    case 0:
                        plain++
                        break;
                }
            }
        }
        const tot = wall + swamp + plain
        const strsign= `☕ mine:${mine} sources:${source}\n\n plain:${(plain / tot*100).toFixed(0)}% swamp:${(swamp / tot*100).toFixed(0)}% wall:${(wall / tot*100).toFixed(0)}%  `
        creep.signController(creep.room.controller,strsign)
        console.log('sign=' +strsign)
        creep.suicide()
    }

}

module.exports = {
    'work': work,
    'born': born,
};