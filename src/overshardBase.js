const interShardManager = require("interShardMemoryManager")
const overshardPath = require("overshardPath")
const stepCache = {}
const roomChangeCache = {}
const roomReach={}
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

    syncStep(creep) {
        if (creep.memory.synctick > 0 && creep.memory.statusx === 'go') {

            creep.memory.step = Math.max(creep.memory.step, this.interShardMemory.mergeMaxKey(Game.shard.name, ["creeps", creep.name, "step"]))
            if (creep.memory.synctick-- < 0) {
                creep.memory.synctick = undefined
            }
            //跑路状态时需要从其他shard同步最新的step数量
        }
    }

    initMemory(creep) {
        //当跨越到下一个shard的时候 有可能出现失忆症 需要到其他shard同步memory
        const originShard = creep.name.split("_")[3]
        const originMemory = interShardManager.get(`shard${originShard}`)
        const creepMemory = _.get(originMemory, ['creeps', creep.name])
        if (creepMemory) {
            creep.memory = creepMemory
            creep.memory.synctick = 5
            this.syncStep(creep)
            this[creep.memory.statusx](creep)
        } else {
            console.log("syncfalse", creep.name)
        }
    }

    init(creep) {
        //出生的第1tick
        const memory = this.interShardMemory.getThisShard(true)
        creep.memory.statusx = "go"
        _.set(memory, ['creeps', creep.name], _.clone(creep.memory))
        //进行shard转移

        this[creep.memory.statusx](creep)

    }
    beOther(creep){
            require(creep.memory.role).work(creep)
    }
    work(creep) {

        if (creep.name in Memory.creeps && Object.keys(Memory.creeps[creep.name]).length>=2) {
                this[creep.memory.statusx](creep)
        } else {
            this.initMemory(creep)
        }
        return
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

        } else {
            this.go(creep)
        }

    }

    go(creep) {
        this.syncStep(creep)

        const lastRoom = this.lastRoomCache[creep.name] || {}
        if (lastRoom.roomName !== creep.pos.roomName) {
            if(roomChangeCache[creep.name]){
                creep.memory.step+=1
                roomChangeCache[creep.name]=undefined
            }
            //专治反复横跳
            const reachTimes=_.get(roomReach,[creep.name,creep.pos.roomName],0)+1
            _.set(roomReach,[creep.name,creep.pos.roomName], reachTimes)
            if(reachTimes>=3){
                roomReach[creep.name]={}
                creep.memory.step+=1
            }
            console.log(`<a href="https://screeps.com/a/#!/room/${Game.shard.name}/${creep.pos.roomName}" title=${Game.shard.name + creep.pos.roomName} >${creep.name}</a>`)
            this.lastRoomCache[creep.name] = {"roomName": creep.room.name}
        }
        let step = creep.memory.step
        const memoryPath = creep.memory.path
        const path = overshardPath[memoryPath[0]][memoryPath[1]].path
        const ret = path[step]

        if (creep.hits < creep.hitsMax) {
            creep.heal(creep)
        }
        if (ret) {
            let target = new RoomPosition(ret.x, ret.y, ret.roomName)
            let flag2=false
            if (creep.pos.isEqualTo(target)) {
                console.log("to another isEqualTo")
                if(step>=path.length-1){
                    creep.memory.step++
                }
            } else if (creep.pos.isNearTo(target) && creep.fatigue === 0) {
                if (Game.shard.name !== ret.shard) {
                    console.log("sharderror!!", `<a href="https://screeps.com/a/#!/room/${Game.shard.name}/${creep.pos.roomName}" title=${Game.shard.name + creep.pos.roomName} >${creep.name}</a>`)
                }
                //临近位置 下1tick走进去

                if (path[step + 1] && path[step + 1].shard !== Game.shard.name) {
                    console.log("to another shard")
                    //要跨越shard了!
                    flag2=true
                } else {
                    console.log("to another room")
                    roomChangeCache[creep.name]=true
                }
                const memory = this.interShardMemory.getThisShard(true)
                _.set(memory, ['creeps', creep.name, 'step'], step + 1)
                _.set(memory, ['creeps', creep.name, 'creepDieTime'], Game.time + creep.ticksToLive * 2)
            }
            if (creep.room.find(FIND_CREEPS).some(c => !c.my)) {
                const pathCache = _.get(creep.memory, ["_move", "path"]) || ""
                if (pathCache.length > 5) creep.memory._move = undefined
                if (creep.hits < creep.hitsMax) {
                    console.log("被打了!", creep.pos, Game.shard.name)
                }
                creep.moveTo(target, {reusePath: 5, plainCost: 1, ignoreCreeps: false})
            } else {
                creep.moveTo(target, {reusePath: 50, plainCost: 1})
            }

            if(flag2){
                creep.memory = undefined
            }
        } else if (ret===undefined) {
            //到了

            creep.memory.statusx = "beOther"
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
                    path: memory.path,
                    statusx: "init",
                    step: 0,
                    missionid: memory.roomName,
                    creepDieTime: Game.time + (body.claim > 0 ? 600 : 1500),
                    role:memory.role
                }
            }
        )

        return act
    }
}

let Manager = new overshardCreepManager()

module.exports = Manager
