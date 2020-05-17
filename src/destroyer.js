function born(spawnnow, creepname, memory) {
    let body = memory.body
    if (!body) {
        body = {
            'tough': 5,
            'claim': 1,
            'move': 6
        }
    }

    memory.cost = undefined
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
                bornTick: Game.time
            }
        }
    )
}


function work(creep) {
    if (Game.flags['go' + creep.memory.missionid]) {
        creep.moveTo(Game.flags['go' + creep.memory.missionid].pos)
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
        const target = creep.room.find(FIND_HOSTILE_CREEPS)[0]
        if (target && target.pos.getRangeTo(creep.pos) <= 8) {
            let boost = require('tower.targetSelecter').isBoost(target.body, RANGED_ATTACK)
            if (boost) {
                creep.memory.status = 'runAway'
            }
        }

    } else if (creep.memory.status === 'runAway') {
        if (Game.flags['dis' + creep.memory.missionid]) {
            creep.moveTo((Game.flags['dis' + creep.memory.missionid].pos))
            return
        }
        const target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
        let boost = require('tower.targetSelecter').isBoost(target.body, RANGED_ATTACK)
        if (boost) {
            if (target && target.pos.getRangeTo(creep.pos) <= 7) {
                let ans = PathFinder.search(creep.pos, {pos: target.pos, range: 7}, {
                    plainCost: 1, swampCost: 5, roomCallback: require('tools').roomc, maxRooms: 2, flee: true
                })
                creep.moveByPath(ans.path);
                return
            }
        } else {
            creep.memory.status = 'claim'
        }
    } else if (creep.memory.status == 'claim') {
        if (Game.flags['dis' + creep.memory.missionid]) {
            creep.moveTo((Game.flags['dis' + creep.memory.missionid].pos))
            return
        }
        if(Game.flags['reClaim']){
            creep.memory.status='reClaim'
            return
        }
        if (creep.pos.roomName == creep.memory.missionid) {
            const controller = Game.rooms[creep.memory.missionid].controller
            if (controller.level === 0) {
                try{
                    Memory.army[creep.memory.missionid].body.destroyer={speedClaim:true}
                }catch (e) {

                }
                const act = creep.claimController(controller)

                if (act == ERR_NOT_IN_RANGE) {
                    creep.moveTo(controller, {ignoreCreeps: false})
                } else if (act == OK || controller.my) {
                    creep.memory.status = 'destroy'
                } else {
                    creep.attackController(controller)
                }

            }
            if (controller.my===false) {

                const act = creep.attackController(controller)
                if (act === ERR_NOT_IN_RANGE) {
                    if (creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3).length > 0) {
                        if (creep.getActiveBodyparts(MOVE) > 40) {
                            creep.moveTo(controller, {swampCost: 1, plainCost: 1, ignoreCreeps: false, reusePath: 3})
                        } else {
                            creep.moveTo(controller, {ignoreCreeps: false, reusePath: 3})
                        }
                    } else {
                        if (creep.getActiveBodyparts(MOVE) > 40) {
                            creep.moveTo(controller, {swampCost: 1, plainCost: 1})
                        } else {
                            creep.moveTo(controller)
                        }
                    }
                }
                if (act === OK) {
                    if (creep.memory.bornTick) {
                        const config = Memory.army[creep.memory.missionid].from[creep.name.split('_')[0]]
                        Memory.army[creep.memory.missionid].nextBorn = creep.memory.bornTick + 1000 - creep.ticksToLive
                    } else {
                        let block = 1000
                        const config = Memory.army[creep.memory.missionid].from[creep.name.split('_')[0]]
                        Memory.army[creep.memory.missionid].nextBorn = Game.time + block - config.path.length - 50 * 3
                    }

                } else if (act === ERR_TIRED && controller.upgradeBlocked && controller.upgradeBlocked > creep.ticksToLive) {
                    if (!creep.memory.bornTick) {
                        const config = Memory.army[creep.memory.missionid].from[creep.name.split('_')[0]]
                        Memory.army[creep.memory.missionid].nextBorn = Game.time + controller.upgradeBlocked - config.path.length - 50 * 3
                    }
                    if (Memory.army[creep.memory.missionid].nextBorn <= Game.time) {
                        creep.suicide()
                        Game.defend.miss(creep.name.split('_')[0])
                    }
                }
            } else {
                const act = creep.claimController(controller)

                if (act == ERR_NOT_IN_RANGE) {
                    creep.moveTo(controller, {ignoreCreeps: false})
                } else if (act == OK || controller.my) {
                    creep.memory.status = 'destroy'
                } else {
                    creep.attackController(controller)
                }
            }

        } else if (creep.pos.roomName === creep.memory.goal[2]) {
            const exitDir = Game.map.findExit(creep.room, creep.memory.missionid)
            const exit = creep.pos.findClosestByRange(exitDir)
            creep.moveTo(exit)
        } else {
            creep.moveTo(new RoomPosition(...creep.memory.goal))
        }
    } else if (creep.memory.status === 'destroy') {
        if (Game.flags['save']) {
            // creep.signController(creep.room.controller,'just stay here no powerbank no depo')
            creep.signController(creep.room.controller,'rush to libexec')
            creep.memory.status = 'suicide'
            return
        }

        const structs = creep.room.find(FIND_STRUCTURES, {
            filter: o => {
                if (o.structureType === STRUCTURE_WALL) {
                    return o.hits
                } else {
                    return o.structureType !== STRUCTURE_CONTROLLER && o.pos.x > 0 && o.pos.x < 49 && o.pos.y > 0 && o.pos.y < 49
                }
            }
        })
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
        const strsign = `☕ mine:${mine} sources:${source}\n\n plain:${(plain / tot * 100).toFixed(0)}% swamp:${(swamp / tot * 100).toFixed(0)}% wall:${(wall / tot * 100).toFixed(0)}%  `
        if (Game.flags['save']) {
            creep.signController(creep.room.controller, 'just stay here no powerbank no depo')
        } else if (creep.room.controller.sign && (creep.room.controller.sign.text.indexOf('overmind') !== -1 || creep.room.controller.sign.text.indexOf('OVERMIND') !== -1)) {
            creep.signController(creep.room.controller, 'Non-coding players unwelcome outside shard0 - expect summary execution')
        } else {
            creep.signController(creep.room.controller, strsign)
        }

        console.log('sign=' + strsign)
        creep.suicide()
    }else if(creep.memory.status==='reClaim'){
        if(creep.room.controller.level===8){
            creep.room.controller.unclaim()
        }else{
            let controller=creep.room.controller
            let act=creep.claimController(controller)
            creep.moveTo(controller)
            if(act===OK){
                creep.suicide()
            }
        }
    }

}
module.exports = {
    'work': work,
    'born': born,
};