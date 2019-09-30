module.exports.miss = miss

function miss(filterName) {
    const flag = Game.flags['destroy']
    if (flag) {
        const roomName = flag.pos.roomName
        try{
            const rooms = Object.keys(Memory.rooms).sort((a, b) => Game.map.getRoomLinearDistance(a, roomName) - Game.map.getRoomLinearDistance(b, roomName))[0]
            Game.war.init([roomName, [flag.pos.x, flag.pos.y, roomName], {destroyer: 1}, [rooms]])
            Memory.army[roomName].from[rooms].cost=550
        }catch (e) {
            console.log('war.miss.flag'+e)
        }
        flag.remove()
    }
    const army = Memory.army
    for (let targetRoomName in army) {
        if (filterName && targetRoomName != filterName) continue
        const plan = army[targetRoomName]
        if(!plan){
            remove(targetRoomName)
            continue
        }
        if (plan.safeMode) continue
        const from = plan.from
        const wait = plan.wait
        const goal = new RoomPosition(wait[0], wait[1], wait[2])
        const creeps = plan.creep
        for (let fromRoomName in from) {
            const config = from[fromRoomName]
            if ((!config.pathttl || Game.time - config.pathttl > 1000) && (config.failedtimes ? config.failedtimes <= 10 : true)) {
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
        const room = Game.rooms[targetRoomName]
        if (room) {
            if (room.controller.owner && !room.controller.my && room.spawns.length == 0&&room.find(FIND_HOSTILE_CREEPS).length==0) {
                remove(targetRoomName)
            }
            if (room.controller.safeMode) {
                plan.safeMode = true
                for (let fromRoomName in from) {
                    for (let role in creeps) {
                        if (Memory.rooms[fromRoomName].missions[role]) {
                            Memory.rooms[fromRoomName].missions[role][targetRoomName] = undefined
                        }
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
module.exports.reset = reset

function reset(targetRoomName) {
    const army = Memory.army
    const plan = army[targetRoomName]
    const from = plan.from
    const creeps = plan.creep
    for (let fromRoomName in from) {
        from[fromRoomName] = {}
    }
    for (let fromRoomName in from) {
        for (let role in creeps) {
            if (Memory.rooms[fromRoomName].missions[role]) {
                Memory.rooms[fromRoomName].missions[role][targetRoomName] = undefined
            }
        }
    }
    miss(targetRoomName)
}

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
Game.war.init(['E19N45',[30,3,'E19N44'],{SEAL:1},['E19N41'],{SEAL:{rampart:true}}])
Game.war.init(['E17N39',[41,47,'E17N40'],{SEAL:1},['E19N41'],{SEAL:{middleheal:true}}])
Game.war.init(['E17N42',[34,47,'E17N43'],{SEAL:1},['E19N41'],{SEAL:{middleheal:true}}])
Game.war.init(['E34N47',[47,15,'E33N47'],{SEAL:1},['E28N46'],{SEAL:{smallattack:true}}])
Game.war.init(['E38N41',[36,2,'E38N40'],{SEAL:1},['E29N41'],{SEAL:{smallattack:true}}])
Game.war.init(['E33N37',[18,2,'E33N36'],{SEAL:1},['E29N38'],{SEAL:{middleheal:true}}])
Game.war.init(['E31N32',[21,47,'E31N33'],{SEAL:1},['E29N38'],{SEAL:{smallattack:true}}])
Game.war.init(['E32N33',[46,16,'E31N33'],{SEAL:1},['E29N38'],{SEAL:{smallattack:true}}])
Game.war.init(['E36N42',[46,21,'E35N42'],{SEAL:1},['E28N46'],{SEAL:{smallattack:true}}])
Game.war.init(['E21N43',[2,9,'E22N43'],{SEAL:2},['E25N43'],{SEAL:{
            'ranged_attack': 5,
            'move': 20,
            'heal': 15,
        }}])
        Game.war.init(['E21N43',[47,34,'E20N43'],{SEAL:1},['E19N41'],{SEAL:{
            'ranged_attack': 5,
            'move': 6,
            'heal': 1,
        }}])
Game.war.init(['E34N42',[32,47,'E34N43'],{SEAL:2},['E28N46'],{SEAL:{bigheal:true}}])
Game.war.init(['E33N41',[18,2,'E33N40'],{SEAL:1},['E29N41','E29N38'],{SEAL:{middleheal:true}}])
Game.war.init(['E33N38',[47,25,'E32N38'],{SEAL:1},['E29N41','E29N38'],{SEAL:{maxheal7:true}}])
Game.war.init(['E34N38',[17,47,'E34N39'],{SEAL:1},['E29N41'],{SEAL:{smallattack:true}}])
Game.war.init(['E19N39',[3,23,'E20N39'],{SEAL:1},['E19N41'],{SEAL:{wall:true}}])
Game.war.init(['E12N41',[39,2,'E12N40'],{SEAL:1},['E14N41'],{SEAL:{smallattack:true}}])
Game.war.init(['E34N38',[16,48,'E34N39'],{SEAL:1},['E29N41','E29N38','E27N38','E27N42'],{SEAL:{'ranged_attack': 10, 'move': 25,'heal': 15,}}])

Game.war.init(['E27N43',[27,6,'E27N43'],{destroyer:1},['E25N43']])

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
    } else if (body.rampart) {
        body = {
            'work': 5,
            'ranged_attack': 3,
            'heal': 13,
            'move': 21,
        }
    } else if (body.middleheal) {
        body = {
            'ranged_attack': 6,
            'move': 19,
            'heal': 13,
        }
    } else if (body.smallattack) {
        body = {
            'ranged_attack': 9,
            'move': 10,
            'heal': 1,
        }
    } else if (body.maxheal7) {
        body = {
            'ranged_attack': 1,
            'move': 19,
            'heal': 15,
        }
    } else if (body.wall) {
        body = {
            'work': 25,
            'move': 25
        }
    } else if (body.claim) {
        body = {
            'claim': 1,
            'move': 1
        }
    }else if(body.middleattack){
        body = {
            'ranged_attack': 5,
            'work':5,
            'move': 15,
            'heal': 5,
        }
    }
    return body
}
