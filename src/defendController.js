let defendRoom = ['W5N31']
let wallNum = Memory.wallNum
let wallCache = {}
Memory.defend = Memory.defend || {}
Memory.defend.wallLock = Memory.defend.wallLock || {}
let defendNumLimit = {
    'W5N31': 1
}
let wallWorkLength={}
module.exports.wallWorkLength=wallWorkLength
function miss(room) {
    if (typeof (room) === 'string') {
        room = Game.rooms[room]
    }
    //wall work
    if (room.controller && room.controller.level <= 7) {
        return
    }
    if (!defendRoom.includes(room.name)) {
        Memory.defend.wallLock[room.name] = undefined
        Memory.wallNum[room.name] = undefined
        room.memory.missions.warWall = undefined
        room.memory.missions.warCarry = undefined
        return
    }
    if (room.storage && room.storage.store.energy < 150e3) {
        Memory.defend.wallLock[room.name] = true
    } else if (room.storage && room.storage.store.energy > 400e3) {
        Memory.defend.wallLock[room.name] = undefined
    }
    if (Game.cpu.bucket < 3000 || Memory.defend.wallLock[room.name]) {
        Memory.wallNum[room.name] = 0
    } else {
        let numPerBucket = (Game.cpu.bucket - 3000) / defendNumLimit[room.name]
        Memory.wallNum[room.name] = Math.ceil(Math.max(0, Game.cpu.bucket / numPerBucket))
        if (Object.keys(Memory.powerPlan).length > 0) {
            Memory.wallNum[room.name] = 0
        }
    }
    if (typeof (room) === 'string') {
        room = Game.rooms[room]
    }
    wallNum = Memory.wallNum


    let wallWorker = room.find(FIND_MY_CREEPS, {filter: o => o.name.split('_')[1] === 'warWall'})
    if (wallNum[room.name] > 0) {
        room.memory.missions.warWall = {}
        room.memory.missions.warCarry = {}
        room.memory.missions.warWall[room.name] = {
            roomName: room.name,
            numfix: wallNum[room.name]
        }
        room.memory.missions.warCarry[room.name] = {
            roomName: room.name,
            numfix: wallNum[room.name]
        }
    } else {
        room.memory.missions.warWall = undefined
        room.memory.missions.warCarry = undefined
    }
    wallWorkLength[room.name]=wallWorker.length
    if (wallWorker.length > 0) {

        let roomWalls = room.find(FIND_STRUCTURES, {
            filter: o => {
                if (o.structureType === STRUCTURE_WALL || o.structureType === STRUCTURE_RAMPART) {
                    if (o.pos.lookFor(LOOK_STRUCTURES).every(p => p.structureType === STRUCTURE_WALL || p.structureType === STRUCTURE_RAMPART || p.structureType === STRUCTURE_ROAD)) {
                        return true
                    }
                }
                return false
            }
        })
        let minhit = _.min(roomWalls, o => o.hits)
        let minFixing = _.min(wallWorker, o => (Game.getObjectById(o.memory.repairtarget) || {hits: 1e9})['hits'])

        if (minhit.hits > 295e6) {
            wallNum[room.name] = 0
        }
        let wallHits
        let fixingHits = (Game.getObjectById(minFixing.memory.repairtarget) || {hits: 1e9})['hits']
        console.log(`最小hits${fixingHits}`)
        if (fixingHits - minhit.hits > 1e6) {
            wallHits = roomWalls.sort((a, b) => a.hits - b.hits)
            wallHits = wallHits.slice(0, wallWorker.length)
            console.log(`${room.name} 重新排序`)
        } else {
            if (wallCache[room.name]) {
                wallHits = wallCache[room.name].slice(0, wallWorker.length).map(o => Game.getObjectById(o))
                console.log(`${room.name} defend使用缓存`)
            } else {
                console.log(`${room.name} defend生成缓存`)
                wallHits = []
                wallWorker.forEach(o => {
                    let repairTarget = Game.getObjectById(o.memory.repairtarget)
                    if (repairTarget) {
                        wallHits.push(repairTarget)
                        let index = roomWalls.findIndex(p => p.id === repairTarget.id)
                        roomWalls.splice(index, 1)
                    }
                })
                roomWalls.sort((a, b) => a.hits - b.hits)
                wallHits = wallHits.concat(roomWalls)
                wallCache[room.name] = wallHits.map(o => o.id)
                wallHits = wallHits.slice(0, wallWorker.length)
            }
        }


        let num = 0
        for (let creepWall of wallWorker) {
            let target = creepWall.memory.repairtarget
            if (target) {

                //如果正在修可以修的 就让他修
                let index = wallHits.findIndex(o => o.id === target)
                if (index !== -1) {
                    //正在修的墙从列表中移除
                    wallHits.splice(index, 1)
                } else {
                    //拔掉 准备换一个修
                    creepWall.memory.repairtarget = undefined
                }
            }
        }
        let used = new Set()
        for (let creepWall of wallWorker) {
            //剩下的强行安排工作
            let target = creepWall.memory.repairtarget
            if (!target) {
                //找最近的可以修的
                let nexttarget = _.min(wallHits, o => (used.has(o.id) ? 999 : o.pos.getRangeTo(creepWall.pos)))
                if (nexttarget) {
                    creepWall.memory.repairtarget = nexttarget.id
                    used.add(nexttarget.id)
                }
            }

        }

        if (require('tower').bigEnemy[room.name] && room.terminal.store.getFreeCapacity(RESOURCE_ENERGY) > 100000 && room.storage.store.energy < 500e3) {
            console.log('buy')
            Game.terminal.autoBuy(room.name, RESOURCE_ENERGY, 100e3, 0.028, 0.04)
        }


    }


}

module.exports.defendRoom = defendRoom
module.exports.miss = miss
