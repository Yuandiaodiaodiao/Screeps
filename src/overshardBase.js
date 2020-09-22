let ans = [
    {shard: 'shard3', roomName: 'E0N30', x: 41, y: 20},
    {shard: 'shard2', roomName: 'E0N30', x: 21, y: 14},
    {shard: 'shard1', roomName: 'W0N30', x: 44, y: 13},
    {shard: 'shard0', roomName: 'W0N59', x: 7, y: 1},
    {shard: 'shard0', roomName: 'W10N60', x: 14, y: 37},
    {shard: 'shard1', roomName: 'W10N30', x: 5, y: 40},
    {shard: 'shard0', roomName: 'W19N50', x: 1, y: 39},
    {shard: 'shard0', roomName: 'W20N39', x: 6, y: 1},
    {shard: 'shard0', roomName: 'W30N40', x: 29, y: 42},
    {shard: 'shard1', roomName: 'W20N20', x: 43, y: 18},
    {shard: 'shard0', roomName: 'W29N30', x: 1, y: 46},
    {shard: 'shard0', roomName: 'W30N10', x: 37, y: 30},
    {shard: 'shard1', roomName: 'W20N10', x: 41, y: 19},
    {shard: 'shard0', roomName: 'W41N10', x: 48, y: 39},
    {shard: 'shard0', roomName: 'W40S20', x: 20, y: 17},
    {shard: 'shard1', roomName: 'W20S10', x: 6, y: 31},
    {shard: 'shard2', roomName: 'W20S10', x: 24, y: 9},
    {shard: 'shard3', roomName: 'W20S12', x: 25, y: 25}
]

class overshardCreepManager {
    constructor() {
        this.lastRoomCache = {}
        this.interShardMemory = require("interShardMemoryManager")
    }

    jump(creep) {
        let flag1 = Game.flags["oB1"]
        let flag2 = Game.flags["oB2"]

        if (flag1 && flag2) {

            Game.war.jumpInAndOut(creep, flag1.pos.roomName, flag2.pos.roomName, flag1.pos, flag2.pos)
        }

        if (flag1.room && flag1.room.spawns.length === 0 && creep.room.name === flag1.room.name) {
            if (creep.getActiveBodyparts(CLAIM) > 0) {
                creep.memory.status = "attackController"
            } else if (creep.getActiveBodyparts(CARRY) > 0) {
                creep.memory.status = "mine"
                creep.memory.role = "build"
                creep.memory.missionid = creep.room.name
            } else {
                creep.memory.status = "destroyAll"
            }
        }

    }

    attackController(creep) {
        let act = creep.claimController(creep.room.controller)
        if (act === ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller)
        } else if (act === OK) {
            creep.suicide()
        } else {
            let act = creep.attackController(reep.room.controller)
            if (act == OK) {
                creep.suicide()
            }
        }
    }

    work(creep) {

        if (creep.memory.status === 'jump') {
            try {
                this.jump(creep)
            } catch (e) {
                console.log(`${creep.name} jump error ${e} ${e.stack}`)
                creep.heal(creep)
            }
        } else if (creep.memory.status === 'attackController') {
            this.attackController(creep)
        } else if (creep.memory.status === "destroyAll") {
            let target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {filter: o => o.hits && o.structureType !== STRUCTURE_RAMPART && o.structureType !== STRUCTURE_SPAWN})
            if (!target) target = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: o => o.hits && o.structureType !== STRUCTURE_WALL})
            if (!target) target = creep.room.find(FIND_STRUCTURES, {filter: o => o.hits})
            if (target) {
                if (!creep.pos.isNearTo(target)) {
                    creep.moveTo(target, {ignoreCreeps: false})
                }
                let ans = creep.attack(target)
                if (ans !== OK) {
                    creep.rangedMassAttack()
                }
            }

        } else if (creep.memory.missionid) {
            return require("opener").work(creep)
        } else {
            this.go(creep)
        }

    }

    go(creep) {
        const lastRoom = this.lastRoomCache[creep.name] || {}
        if (lastRoom.roomName !== creep.pos.roomName) {
            console.log(creep.pos)

            console.log(`<a href="https://screeps.com/a/#!/room/${Game.shard.name}/${creep.pos.roomName}" title="1" >${creep.name}</a>`)
            this.lastRoomCache[creep.name] = {"roomName": creep.room.name}
        }
        let step = creep.memory.step
        if (step < 0 || step === undefined) {
            creep.memory.step = step = this.interShardMemory.mergeMaxKey(Game.shard.name, ["creeps", creep.name, "step"])
            if (step < 0) {
                return
            }
        }
        let ret = ans[step]
        // 防止万一
        for (let index in ans) {
            if (index < step - 1) continue
            let path = ans[index]
            if (path.shard === Game.shard.name) {
                if (!ret) {
                    ret = path;
                } else {
                    if (Game.map.getRoomLinearDistance(creep.pos.roomName, path.roomName) <
                        Game.map.getRoomLinearDistance(creep.pos.roomName, ret.roomName)) {
                        ret = path;
                        step = Number(index)
                    }
                }
            }
        }
        if(creep.hits<creep.hitsMax){
            console.log("被打了!",creep.pos)
            creep.heal(creep)
        }
        if (ret) {
            let target = new RoomPosition(ret.x, ret.y, ret.roomName)
            creep.moveTo(target, {reusePath: 25, plainCost: 1})
            if (creep.pos.getRangeTo(target) === 1) {
                step += 1
                if (ans[step] && ans[step].shard !== Game.shard.name) {
                    console.log("to another shard")
                    //要跨越shard了!
                    creep.memory = undefined
                } else {
                    console.log("to another room")
                    creep.memory.step = step
                }
                let memory = this.interShardMemory.getThisShard(true)
                _.set(memory, ['creeps', creep.name, 'step'], step)
                _.set(memory, ['creeps', creep.name, 'creepDieTime'], Game.time + creep.ticksToLive * 2)
            }
        } else if (!ret && step > 0) {
            //到了

            creep.memory.status = "jump"

        }
    }


    born(spawnnow, creepname, memory) {

        let body = {
            'move': 5
        }
        if (memory.body) {
            body = memory.body
        }
        let bodyarray = Game.tools.generatebody(body, spawnnow)
        let act = spawnnow.spawnCreep(
            bodyarray,
            creepname,
            {
                memory: {
                    step: 0,
                    missionid: memory.roomName,
                    creepDieTime: Game.time + (body.claim > 0 ? 600 : 1500),
                }
            }
        )

        return act
    }
}

let Manager = new overshardCreepManager()

module.exports = Manager
