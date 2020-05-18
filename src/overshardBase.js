module.exports.main = function () {
    Object.values(Game.creeps).forEach(obj => {
        try {
            if (!obj.spawning) {
                const type = obj.name.split('_')[1]
                require(type).work(obj)
            }
        } catch (e) {
            console.log('role=' + obj.name + 'error' + e)
        }
    })
}

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
    {shard: 'shard2', roomName: 'W20S10', x: 24, y: 9}
]

class overshardCreepManager {

    work(creep) {
        let ret = undefined;
        for (let path of ans) {//ans最好手动复制过来，不要这么直接用
            if (path.shard === Game.shard.name) {
                if (!ret) {
                    ret = path;
                } else {
                    if (Game.map.getRoomLinearDistance(creep.pos.roomName, path.roomName) <
                        Game.map.getRoomLinearDistance(creep.pos.roomName, ret.roomName)) {
                        ret = path;
                    }
                }
            }
        }
        if (ret)
            creep.moveTo(new RoomPosition(ret.x, ret.y, ret.roomName))
    }
    born(spawnnow, creepname, memory) {

        let body = {
            'move': 5
        }
        let bodyarray =Game.tools.generatebody(body, spawnnow)
        return spawnnow.spawnCreep(
            bodyarray,
            creepname,
            {
                memory: {
                    missionid: memory.roomName,
                }
            }
        )
    }
}

let Manager = overshardCreepManager()
module.exports.work = Manager.work
module.exports.born = Manager.born
module.exports.manager = Manager