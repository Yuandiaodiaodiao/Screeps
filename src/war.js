module.exports.miss = miss

function miss() {
    const army = Memory.army
    for (let targetRoomName in army) {
        const plan = army[targetRoomName]
        const from = plan.from
        const wait = plan.wait
        const goal = new RoomPosition(wait[0], wait[1], wait[2])
        const creeps = plan.creep
        for (let fromRoomName in from) {
            const config = from[fromRoomName]
            if (!config.pathttl || Game.time - config.pathttl > 1000) {
                const ans = PathFinder.search(Game.rooms[fromRoomName].spawns[0].pos, {pos: goal, range: 2}, {
                    plainCost: 1,
                    swampCost: 5,
                    roomCallback: require('tools').roomc_nocreep,
                    maxOps: 20000,
                    maxRooms: 64,
                    maxCost: config.maxCost || 1000,
                })
                if (ans.pos <= 1 && ans.incomplete) {
                    console.log(`search failed from${fromRoomName}to${targetRoomName}use ops${ans.ops} cost${ans.cost}`)
                    from[fromRoomName] = undefined
                    continue
                }
                if (ans.incomplete) {
                    console.log(`search failed from${fromRoomName}to${targetRoomName}use ops${ans.ops} cost${ans.cost}`)
                    config.failedtimes = (config.failedtimes || 0) + 1
                    config.path = undefined
                    if (config.failedtimes && config.failedtimes > 10) {
                        console.log(`from${fromRoomName}to${targetRoomName}failed${config.failedtimes}times`)
                    }
                    continue
                }
                console.log(`from${fromRoomName}to${targetRoomName}use ops${ans.ops} cost${ans.cost}`)
                const path = []
                for (let x of ans.path) {
                    path.push([x.x, x.y, x.roomName])
                }
                config.path = path
                console.log(`pathstr=${JSON.stringify(path)}`)
                config.pathttl = Game.time
                config.cost = ans.cost
            }
            if (config.path) {
                for (let role in creeps) {
                    const body = genbody(plan.body ? plan.body[role] : undefined)
                    Memory.rooms[fromRoomName].missions[role] = Memory.rooms[fromRoomName].missions[role] || {}
                    Memory.rooms[fromRoomName].missions[role][targetRoomName] = {
                        goal: wait,
                        cost: config.cost,
                        targetRoomName: targetRoomName,
                        numfix: creeps[role],
                        body: body
                    }

                }

            }


        }
    }
}

module.exports.remove = remove

function remove(targetRoomName) {
    const army = Memory.army
    const plan = army[targetRoomName]
    const from = plan.from
    const creeps = plan.creep
    for (let fromRoomName in from) {
        const config = from[fromRoomName]
        for (let role in creeps) {
            if (Memory.rooms[fromRoomName].missions[role]) {
                Memory.rooms[fromRoomName].missions[role][targetRoomName] = undefined
            }
        }
    }
    army[targetRoomName] = undefined
}

module.exports.init = init

function init(input) {
    //['E23N41',[25,47,'E23N42'],{SEAL:1},['E25N43']]
    const army = Memory.army
    army[input[0]] = {}
    const plan = army[input[0]]
    plan.wait = input[1]
    plan.creep = input[2]
    plan.from = {}
    plan.mode = 'alone'
    for (let x of input[3]) {
        plan.from[x] = {}
    }
    if (input[4]) {
        plan.body = input[4]
    }
}

/*
Game.war.init(['E22N42',[2,27,'E23N42'],{SEAL:1},['E25N43'],{SEAL:{bigheal:true}}])
 */

function genbody(body) {
    if (!body) return undefined
    if (body.bigheal) {
        body = {
            'ranged_attack': 10 - 0.001,
            'heal': 15 - 0.001,
            'move': 25
        }
    } else if (body.seal) {
        body = {
            'tough': 6,
            'ranged_attack': 3,
            'move': 10,
            'heal': 1,
        }
    }
    return body
}
