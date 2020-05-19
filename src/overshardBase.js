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

    work(creep) {

        const lastRoom = this.lastRoomCache[creep.name] || {}
        if (lastRoom.roomName !== creep.pos.roomName) {
            console.log(creep.pos)
            console.log(`<a href="https://screeps.com/a/#!/room/${Game.shard.name}/${creep.pos.roomName}" title="1" >${creep.name}</a>`)
            this.lastRoomCache[creep.name] = {"roomName": creep.room.name}
        }
        let step = creep.memory.step
        if (!step) {
            creep.memory.step = step = this.interShardMemory.mergeMaxKey(Game.shard.name, ["creeps", creep.name, step])
        }
        let ret = ans[step]

        if (ret) {
            let target = new RoomPosition(ret.x, ret.y, ret.roomName)
            creep.moveTo(target, {reusePath: 25, plainCost: 1})
            if (creep.pos.isEqualTo(target)) {
                //要跨越shard了!
                step+=1
                let memory = this.interShardMemory.getThisShard(true)
                _.set(memory, ['creeps', creep.name, 'step'], step)
            }
        }
    }

    born(spawnnow, creepname, memory) {

        let body = {
            'move': 5
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
