module.exports = {
    'miss': miss,
    'solveplan': solveplan,
    'cache': cache,
    'logcache': logcache
}
var powerRoom = {
    'E28N46': ['E30N46', 'E30N47', 'E30N48', 'E30N49'],
    'E27N38': ['E30N37', 'E30N36','E30N35','E30N34'],
    'E29N38': ['E30N38', 'E30N39'],
    'E29N41': ['E30N40', 'E31N40','E32N40','E33N40'],
    'E25N43': ['E23N40', 'E24N40', 'E25N40', 'E26N40', 'E27N40'],
    'E27N42': ['E28N40', 'E29N40'],
    'E19N41': ['E18N40', 'E19N40', 'E20N40', 'E20N41', 'E20N39'],
    'E14N41': ['E13N40', 'E14N40', 'E15N40']
}

function miss() {
    Memory.powerPlan = Memory.powerPlan || {}
    for (let roomName in powerRoom) {
        const room = Game.rooms[roomName]
        if (!room) {
            console.log('error room=' + roomName + JSON.stringify(room))
            continue
        }
        const terminal = room.terminal
        if ((terminal.store[RESOURCE_POWER] || 0) > 50000) continue
        const rooms = powerRoom[roomName]
        for (let roomn of rooms) {
            const roomc = require('observer').observerCache[roomn]
            if (roomc && roomc.powerBank && roomc.power >= 1000 && Game.time - roomc.startTime <= 500 && !Memory.powerPlan[roomn] && Game.rooms[roomName].storage.store[RESOURCE_ENERGY] > 300000) {
                const targetpos = new RoomPosition(roomc.pos[0], roomc.pos[1], roomn)
                const ans = PathFinder.search(Game.rooms[roomName].spawns[0].pos, {pos: targetpos, range: 3}, {
                    plainCost: 1, swampCost: 5, roomCallback: require('tools').roomc_nocreep, maxOps: 10000
                })
                if (ans.incomplete == true) {
                    console.log('cant find' + roomName + 'to' + roomn)
                    continue
                }
                let position = []
                for (let x of ans.path) {
                    position.push([x.x, x.y, x.roomName])
                }
                Memory.powerPlan[roomn] = {
                    roadcost: ans.cost,
                    targetpos: [targetpos.x, targetpos.y, targetpos.roomName],
                    status: 1,
                    spawnRoom: roomName,
                    startTime: roomc.startTime,
                    power: roomc.power,
                    position: position,
                    carry: Math.ceil(roomc.power / 1250),
                    timelock: 0,
                }
                solveplan(roomn)
            }
            // require('observer').observer_queue.add(roomn)
        }
    }
}

function solveplan(roomn) {
    let plan = Memory.powerPlan[roomn]
    const spawnRoom = plan.spawnRoom
    let missions = Memory.rooms[spawnRoom].missions
    if (plan.status <= 3 && Game.time - plan.startTime > 5000 + 1500) plan.status = 4
    if (plan.status == 1) {
        //attack healer注入
        missions["power-a"] = missions["power-a"] || {}
        missions['power-a'][roomn] = missions['power-a'][roomn] || {
            roomn: roomn,
            cost: plan.roadcost,
            numfix: 1
        }
        missions["power-b"] = missions["power-b"] || {}
        missions['power-b'][roomn] = missions['power-b'][roomn] || {
            roomn: roomn,
            cost: plan.roadcost,
            numfix: 2
        }
    } else if (plan.status == 2) {
        //attack
        missions['power-a'] ? missions['power-a'][roomn] = undefined : undefined
    } else if (plan.status == 3) {
        missions['power-a'] ? missions['power-a'][roomn] = undefined : undefined
        missions['power-b'] ? missions['power-b'][roomn] = undefined : undefined
        //carry注入
        missions["power-c"] = missions["power-c"] || {}
        missions['power-c'][roomn] = missions['power-c'][roomn] || {
            roomn: roomn,
            cost: plan.roadcost,
            numfix: Math.ceil(plan.carry),
        }
    } else if (plan.status >= 4) {
        //carry取消 plan取消
        missions['power-a'] ? missions['power-a'][roomn] = undefined : undefined
        missions['power-b'] ? missions['power-b'][roomn] = undefined : undefined
        missions['power-c'] ? missions['power-c'][roomn] = undefined : undefined
        if (Game.time - plan.timelock > 5) {
            plan.status = 5
            Memory.powerPlan[roomn] = undefined
        }
    }

}


function cache() {
    for (let roomName in powerRoom) {
        const rooms = powerRoom[roomName]
        for (let roomn of rooms) {
            if (!Memory.powerPlan[roomn])
                require('observer').observer_queue.add(roomn)
        }
    }
}

function logcache() {
    for (let roomName in powerRoom) {
        const rooms = powerRoom[roomName]
        for (let roomn of rooms) {
            console.log(roomn + ' ' + JSON.stringify(require('observer').observerCache[roomn]))
        }
    }
}
