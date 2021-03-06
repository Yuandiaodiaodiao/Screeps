let oriSay = Creep.prototype.say
Creep.prototype.say = function (msg, pub = true) {
    return oriSay.call(this, msg, pub)
}
PowerCreep.prototype.say = function (msg, pub = true) {
    return oriSay.call(this, msg, pub)
}
if (!Creep.prototype._rangedMassAttack) {
    Creep.prototype._rangedMassAttack = Creep.prototype.rangedMassAttack
    Creep.prototype.rangedMassAttack = function () {
        this.say('⚡')
        return this._rangedMassAttack()

    }
}
if (!Creep.prototype._rangedAttack) {
    Creep.prototype._rangedAttack = Creep.prototype.rangedAttack
    Creep.prototype.rangedAttack = function (target) {
        const ans = this._rangedAttack(target)
        if (ans === OK) {
            this.say('🏹')
        }
        return ans

    }
}


if (!Creep.prototype._attack) {
    Creep.prototype._attack = Creep.prototype.attack
    Creep.prototype.attack = function (target) {
        const ans = this._attack(target)
        if (ans === OK) {
            this.say('👊')
        }
        return ans

    }
}

if (!Creep.prototype._dismantle) {
    Creep.prototype._dismantle = Creep.prototype.dismantle
    Creep.prototype.dismantle = function (target) {
        const ans = this._dismantle(target)
        if (ans === OK) {
            this.say('💪')
        }
        return ans

    }
}


module.exports.miss = miss

function miss(filterName) {
    const flag = Game.flags['destroy']
    try {
        if (flag) {
            const roomName = flag.pos.roomName
            try {
                const rooms = _.min(Object.keys(Memory.rooms), a => (a === roomName || Game.rooms[a].spawns.length === 0) ? Infinity : Game.map.getRoomLinearDistance(a, flag.pos.roomName))

                let arr = [roomName, [flag.pos.x, flag.pos.y, roomName], {destroyer: 1}, [rooms]]
                if (flag.color === COLOR_RED) {
                    arr[2]['SEAL'] = 1
                    Game.rooms[rooms].createFlag(1, 1, 'rush' + flag.pos.roomName)
                }

                Game.war.init(arr)
                Memory.army[roomName].from[rooms].cost = -1
            } catch (e) {
                console.log('war.miss.flag' + e)
            }
        }
    } catch (e) {
        console.log('war.miss.flag error' + e)
    }
    if (Game.flags['destroy']) {
        Game.flags['destroy'].remove()
    }

    const flagStart = Game.flags['warstart']
    const flagWait = Game.flags['warwait']
    if (flagWait) {
        if (!flagWait.memory.init) {
            flagWait.memory.init = true
            flagWait.memory.fromRoom = []
            const rooms = _.min(Object.keys(Memory.rooms), a => Game.rooms[a].spawns.length === 0 ? Infinity : Game.map.getRoomLinearDistance(a, flagWait.pos.roomName))

            flagWait.memory.fromRoom.push(rooms)
            flagWait.memory.partType = ''
            if (flagWait.color === COLOR_RED) {
                flagWait.memory.partType = 'smallattack'
            } else if (flagWait.color === COLOR_GREEN) {
                flagWait.memory.partType = 'heal15'
            }
        }
    } else {
        delete Memory.flags['warwait']
    }
    if (flagStart && flagWait) {
        const input = [flagStart.pos.roomName, [flagWait.pos.x, flagWait.pos.y, flagWait.pos.roomName],
            {SEAL: 1},
            flagWait.memory.fromRoom,
            {SEAL: {}}
        ]
        input[4]['SEAL'][flagWait.memory.partType] = true
        Game.war.init(input)
        if (flagStart.color === COLOR_RED) {
            Game.rooms[flagWait.memory.fromRoom[0]].createFlag(1, 1, 'rush' + flagStart.pos.roomName)
        }
        flagStart.remove()
        delete Memory.flags[flagWait.name]
        flagWait.remove()
    }


    const army = Memory.army
    for (let targetRoomName in army) {
        if (filterName && targetRoomName != filterName) continue
        const plan = army[targetRoomName]
        if (!plan) {
            remove(targetRoomName)
            continue
        }
        if (plan.safeMode) continue
        const from = plan.from
        const wait = plan.wait
        const goal = new RoomPosition(wait[0], wait[1], wait[2])
        const creeps = plan.creep
        for (let fromRoomName in from) {
            const fromRoom = Game.rooms[fromRoomName]
            if (plan.boost) {
                const reaction = fromRoom.memory.reaction
                if (!reaction.preBoost || reaction.preBoost.indexOf(targetRoomName) < 0) {
                    if (!reaction.preBoost) {
                        reaction.preBoost = [targetRoomName]
                        reaction.status = 'collect'
                    } else {
                        reaction.preBoost.push(targetRoomName)
                    }
                }
                if (!reaction.boostReady) {
                    continue
                }
            }
            const config = from[fromRoomName]

            if (config.path) {
                for (let role in creeps) {
                    const body = genbody(plan.body ? plan.body[role] : undefined)
                    let cost = config.cost
                    if (role === 'destroyer') {
                        cost = 0

                        // console.log('' + Game.time + 'genmission' + fromRoomName + role + 'to' + targetRoomName)
                    }
                    let teamNum
                    if (role === 'boostAttack') {
                        teamNum = plan.teamNum
                    }
                    fromRoom.memory.missions[role] = Memory.rooms[fromRoomName].missions[role] || {}
                    fromRoom.memory.missions[role][targetRoomName] = {
                        goal: wait,
                        cost: cost,
                        targetRoomName: targetRoomName,
                        numfix: creeps[role],
                        body: body,
                        teamNum: teamNum
                    }

                }

            }
            if (plan.nextBorn && plan.nextBorn > Game.time) {
                for (let fromRoomName in from) {
                    for (let role in creeps) {
                        if (role === 'destroyer') {
                            // console.log('' + Game.time + 'cancel' + fromRoomName + role + 'to' + targetRoomName)
                            if (Memory.rooms[fromRoomName].missions[role]) {
                                Memory.rooms[fromRoomName].missions[role][targetRoomName] = undefined
                            }
                        }

                    }
                }
            }
            let allClaim = Object.keys(creeps).every(o => o === "destroyer")
            if ((!config.pathttl || Game.time - config.pathttl > 3000) && (config.failedtimes ? config.failedtimes <= 90 : true)) {
                const ans = PathFinder.search(fromRoom.spawns[0].pos, {pos: goal, range: 2}, {
                    plainCost: 1,
                    swampCost: 5,
                    roomCallback: require('tools').roomc_nocreep,
                    maxOps: 100000,
                    maxRooms: 64,
                    maxCost: config.maxCost || allClaim ? 600 : 1400,
                })
                // if (ans.pos <= 1 && ans.incomplete) {
                //     //????为什么要移除from
                //     console.log(`search failed from${fromRoomName}to${targetRoomName}use ops${ans.ops} cost${ans.cost}`)
                //     from[fromRoomName] = undefined
                //     continue
                // }
                if (ans.incomplete) {
                    console.log(`search failed from${fromRoomName}to${targetRoomName}use ops${ans.ops} cost${ans.cost}`)
                    config.failedtimes = (config.failedtimes || 0) + 1
                    // config.path = undefined
                    if (config.failedtimes && config.failedtimes > 30) {
                        console.log(`from${fromRoomName}to${targetRoomName}failed${config.failedtimes}times`)
                    }
                    continue
                } else {
                    config.failedtimes = 1
                }
                console.log(`from${fromRoomName}to${targetRoomName}use ops${ans.ops} cost${ans.cost}`)
                const path = []
                for (let x of ans.path) {
                    path.push([x.x, x.y, x.roomName])
                }
                config.path = path
                console.log(`pathstr=${JSON.stringify(path)}`)
                config.pathttl = Game.time
                if (config.cost !== -1) {
                    config.cost = ans.cost
                }


            }


        }


        const room = Game.rooms[targetRoomName]
        if (room && !plan.keep) {
            if (room.controller.owner && !room.controller.my && room.spawns.length == 0 && room.find(FIND_HOSTILE_CREEPS).length == 0) {
                let ifDestroyer = Object.keys(plan.creep).every(o => o === "destroyer")
                if (ifDestroyer) {
                    //destroyer 让他们自己处理
                } else {
                    remove(targetRoomName)
                }
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

module.exports.stop = stop

function stop(targetRoomName) {
    const army = Memory.army
    const plan = army[targetRoomName]
    const from = plan.from
    const creeps = plan.creep
    plan.safeMode = true
    for (let fromRoomName in from) {
        const config = from[fromRoomName]
        for (let role in creeps) {
            if (Memory.rooms[fromRoomName].missions[role]) {
                Memory.rooms[fromRoomName].missions[role][targetRoomName] = undefined
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
        if (plan.boost) {
            const fromRoom = Game.rooms[fromRoomName]
            const reaction = fromRoom.memory.reaction
            reaction.preBoost.splice(reaction.preBoost.indexOf(targetRoomName), 1)
            if (reaction.preBoost.length == 0) {
                reaction.preBoost = undefined
                reaction.status = 'collect'
                reaction.boostReady = undefined
            }
        }
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
    if (input[5]) {
        if (input[5].indexOf('keep') >= 0) {
            plan.keep = true
        }
        if (input[5].indexOf('boost') >= 0) {
            plan.boost = true
        }
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
Game.war.init(['E33N38',[47,25,'E32N38'],{SEAL:1},['E29N41'],{SEAL:{heal:true}}])
Game.war.init(['E34N38',[17,47,'E34N39'],{SEAL:1},['E29N41'],{SEAL:{smallattack:true}}])
Game.war.init(['E19N39',[3,23,'E20N39'],{SEAL:1},['E19N41'],{SEAL:{wall33:true}}])
Game.war.init(['E21N45',[43,15,'E20N45'],{SEAL:1},['E19N41'],{SEAL:{middleheal:true}}])
Game.war.init(['E18N46',[3,27,'E19N46'],{SEAL:1},['E19N41'],{SEAL:{middleheal:true}}])
Game.war.init(['E12N41',[39,2,'E12N40'],{SEAL:1},['E14N41'],{SEAL:{smallattack:true}}])
Game.war.init(['E17N41',[16,2,'E17N40'],{SEAL:1},['E19N41'],{SEAL:{heal:true}}])
    Game.war.init(['E11N39',[23,44,'E11N40'],{SEAL:1},['E14N41'],{SEAL:{smallattack:true}}])
Game.war.init(['E34N38',[16,48,'E34N39'],{SEAL:1},['E29N41','E29N38','E27N38','E27N42'],{SEAL:{'ranged_attack': 10, 'move': 25,'heal': 15,}}])

Game.war.init(['E27N43',[27,6,'E27N43'],{destroyer:1},['E25N43']])
Game.war.init(['E33N36',[11,2,'E33N35'],{SEAL:1},['E29N38','E27N38'],{SEAL:{heal:true}},true])
Game.war.init(['E33N39',[47,35,'E32N39'],{SEAL:1},['E29N41'],{SEAL:{heal:true}},true])
Game.war.init(['E21N48',[46,24,'E20N48'],{SEAL:1},['E19N41'],{SEAL:{middleheal:true}}])
Game.war.init(['E22N49',[32,45,'E22N50'],{SEAL:1},['E28N46'],{SEAL:{middleheal:true}}])
Game.war.init(['E21N49',[48,20,'E20N49'],{SEAL:1},['E19N41'],{SEAL:{middleheal:true}}])
Game.war.init(['E32N39',[16,47,'E32N40'],{SEAL:2,destroyer:1},['E29N41','E29N38','E27N38'],{SEAL:{m25ra10h15:true}}])
Game.war.init(['E33N39',[13,47,'E33N40'],{SEAL:2,destroyer:1},['E29N41','E29N38','E27N38'],{SEAL:{m25ra10h15:true}}])
Game.war.init(['E32N38',[25,43,'E32N39'],{SEAL:1,destroyer:1},['E29N41','E29N38','E27N38'],{SEAL:{m25ra10h15:true}}])
Game.war.init(['E34N39',[14,47,'E34N40'],{SEAL:1},['E29N41','E29N38','E27N38'],{SEAL:{m25ra10h15:true}}])
Game.war.init(['E33N39',[44,47,'E33N40'],{SEAL:1},['E29N41','E29N38','E27N38'],{SEAL:{wall:true}}])
Game.war.init(['E34N39',[13,48,'E34N40'],{destroyer:1},['E29N41'],{destroyer:{claim25:true}}])

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
    } else if (body.ra10) {
        body = {
            'ranged_attack': 10,
            'move': 10
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
    } else if (body.claim25) {
        body = {
            'claim': 25,
            'move': 25
        }
    } else if (body.middleattack) {
        body = {
            'ranged_attack': 5,
            'work': 5,
            'move': 15,
            'heal': 5,
        }
    } else if (body.heal15) {
        body = {
            'ranged_attack': 10,
            'move': 25,
            'heal': 15,
        }
    } else if (body.heal17) {
        body = {
            'ranged_attack': 8,
            'move': 25,
            'heal': 17,
        }
    } else if (body.wall33) {
        body = {
            'work': 33,
            'move': 17
        }
    } else if (body.ra5a15h5) {
        body = {
            'ranged_attack': 5,
            'attack': 15,
            'move': 25,
            'heal': 5,
        }
    } else if (body.m25ra10h15) {
        body = {
            'move': 25,
            'ranged_attack': 10,
            'heal': 15,
        }
    } else if (body.tough25) {
        body = {
            'tough': 25,
            'move': 25,
        }
    } else if (body.heallv8) {
        body = {
            'tough': 14,
            'move': 10,
            'heal': 26
        }
    } else if (body.heallv7) {
        body = {
            'tough': 10,
            'move': 10,
            'ranged_attack': 10,
            'heal': 20,
        }
    } else if (body.heallv75) {
        body = {
            'tough': 10,
            'move': 10,
            'ranged_attack': 5,
            'heal': 25,
        }
    } else if (body.speedClaim) {
        body = {
            'tough': 3,
            'move': 42,
            'claim': 5,
        }
    } else if (body.heallv6) {
        body = {
            'tough': 6,
            'move': 24,
            'heal': 12,
            'ranged_attack': 6,
        }
    } else if (body.attacklv8) {
        body = {
            'tough': 12,
            'work': 28,
            'move': 10,
        }
    } else if (body.alv8) {
        body = {
            'tough': 15,
            'attack': 25,
            'move': 10,
        }
    } else if (body.attacklv7) {
        body = {
            'tough': 10,
            'work': 30,
            'move': 10,
        }
    } else if (body.attacklv6) {
        body = {
            'tough': 6,
            'work': 34,
            'move': 10,
        }
    } else if (body.core4) {
        body = {
            'tough': 10,
            'ranged_attack': 30,
            'move': 10,
        }
    }
    return body
}

var lodash = require('lodash-my')
module.exports.getEnemy = getEnemy

function getEnemy(creep) {
    const targets = creep.room.find(FIND_HOSTILE_CREEPS, {filter: o => !o.pos.lookFor(LOOK_STRUCTURES).some(j => j.structureType === STRUCTURE_RAMPART)})
    const dangerous = targets.filter(isDangerous)
    if (dangerous.length > 0) {
        const nextTargets = []
        const nearTargets = []
        const farTargets = []
        dangerous.forEach(o => {
            const range = o.pos.getRangeTo(creep)
            if (range <= 1) {
                nextTargets.push(o)
            } else if (range <= 3) {
                nearTargets.push(o)
            } else {
                farTargets.push(o)
            }
        })
        const nextTarget = lodash.maxBy(nextTargets, howDangerous)
        const nearTarget = lodash.maxBy(nearTargets, howDangerous)
        const farTarget = lodash.minBy(farTargets, o => o.pos.getRangeTo(creep))
        return [nextTarget, nearTarget, farTarget, true]
    } else if (targets.length > 0) {
        const target = lodash.minBy(targets, o => o.pos.getRangeTo(creep))
        return [target]
    } else {
        return []
    }


}

module.exports.fightDangerous = fightDangerous

function fightDangerous(creep, enemys) {
    let haveAttack = creep.getActiveBodyparts(ATTACK)
    let haveRange = creep.getActiveBodyparts(RANGED_ATTACK)
    let haveHeal = creep.getActiveBodyparts(HEAL)
    let target = enemys[0]
    if (target) {
        if (haveAttack) {
            creep.attack(target)
            haveHeal = 0
        }
        if (haveRange) {
            creep.rangedMassAttack()

        }
        if (haveAttack >= 10) {
            creep.moveTo(target, {serializeMemory: false, ignoreCreeps: false})
        } else {
            const ans = PathFinder.search(creep.pos, {pos: target.pos, range: 4}, {
                plainCost: 1, swampCost: 5, roomCallback: require('tools').roomc, maxRooms: 1, flee: true
            })
            creep.moveByPath(ans.path)
        }
    } else if (target = enemys[1]) {
        const distance = creep.pos.getRangeTo(target)
        if (haveHeal) {
            creep.heal(creep)
        }
        if (haveRange) {
            creep.rangedAttack(target)
        }
        if (haveAttack >= 10) {
            creep.moveTo(target, {serializeMemory: false, ignoreCreeps: false})
        } else if (distance <= 2) {
            const ans = PathFinder.search(creep.pos, {pos: target.pos, range: 4}, {
                plainCost: 1, swampCost: 5, roomCallback: require('tools').roomc, maxRooms: 1, flee: true
            })
            creep.moveByPath(ans.path)
        } else if (distance == 4) {
            creep.moveTo(target, {serializeMemory: false, ignoreCreeps: false})
        } else if (distance > 4) {
            creep.moveTo(target, {reusePath: Math.max(5, Math.floor((distance - 4) / 2)), ignoreCreeps: false})
        }
    } else if (target = enemys[2]) {
        const distance = creep.pos.getRangeTo(target)
        creep.moveTo(target, {reusePath: Math.max(5, Math.floor((distance - 4) / 2)), ignoreCreeps: false})
    }

}

module.exports.fightNormal = fightNormal

function fightNormal(creep, enemy) {
    let haveAttack = creep.getActiveBodyparts(ATTACK)
    let haveRange = creep.getActiveBodyparts(RANGED_ATTACK)
    let haveHeal = creep.getActiveBodyparts(HEAL)
    let target = enemy[0]
    if (target) {
        const distance = creep.pos.getRangeTo(target)
        if (haveAttack && distance <= 1) {
            creep.attack(target)
            haveHeal = 0
        }
        if (haveRange && distance <= 1) {
            creep.rangedMassAttack()
        }
        if (haveRange && distance > 1) {
            creep.rangedAttack(target)
        }
        if (haveHeal) {
            creep.heal(creep)
        }
        creep.moveTo(target, {reusePath: 3, ignoreCreeps: false})
    }
}

let dangerousParts = new Set([RANGED_ATTACK, ATTACK, HEAL])

function isDangerous(creep) {
    return creep.body.some(bodypart => dangerousParts.has(bodypart.type))
}

let dangerousLevel = {
    'attack': 3,
    'ranged_attack': 2,
    'heal': 1,
}
module.exports.howDangerous = howDangerous

function howDangerous(creep) {
    let level = 0
    creep.body.forEach(bodypart => {
        const type = bodypart.type
        level = Math.max(dangerousLevel[type] || -1, level)
    })
    return level
}

module.exports.workRush = workRush

function workRush(creep) {
    if (Game.time % 20 == 0) {
        Game.memory.roomCachettl[creep.pos.roomName] = 0
    }
    if (creep.pos.roomName == creep.memory.missionid) {
        let target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {filter: obj => obj.hits && obj.structureType != STRUCTURE_RAMPART && (!obj.pos.lookFor(LOOK_STRUCTURES).some(obj => obj.structureType == STRUCTURE_RAMPART)) && obj.structureType != STRUCTURE_CONTROLLER})
        if (!target) target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {filter: obj => obj.hits && obj.structureType == STRUCTURE_RAMPART})
        if (!target) target = creep.pos.findClosestByPath(FIND_HOSTILE_CONSTRUCTION_SITES)
        if (!target) target = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: obj => obj.hits && obj.structureType != STRUCTURE_CONTROLLER})
        if (target) {
            creep.moveTo(target, {ignoreCreeps: false, reusePath: 10})
            const act = creep.dismantle(target)
        }

    } else {
        const exitDir = Game.map.findExit(creep.room, creep.memory.missionid)
        const exit = creep.pos.findClosestByRange(exitDir)
        creep.moveTo(exit)
    }
    if (!Game.flags['rush' + creep.memory.missionid]) {
        creep.memory.status = 'fighting'
    }
}

module.exports.moveAwayFromSide = moveAwayFromSide

function moveAwayFromSide(creep) {
    if (creep.pos.x === 0) creep.move(RIGHT)
    else if (creep.pos.x === 49) creep.move(LEFT)
    else if (creep.pos.y === 0) creep.move(BOTTOM)
    else if (creep.pos.y === 49) creep.move(TOP)
}

module.exports.isSide = isSide

function isSide(creep) {
    return (creep.pos.x === 0 || creep.pos.x === 49 || creep.pos.y === 0 || creep.pos.y === 49)
}

module.exports.jumpInAndOut = jumpInAndOut

function jumpInAndOut(creep, targetRoom, safeRoom, posTo, posSafe) {

    if (creep.pos.roomName === targetRoom) {
        if (Game.time % (Math.ceil(Math.random() * 5)) === 0) {
            if (creep.room.towers.length === 0) {
                Game.war.moveAwayFromSide(creep)
            }
        }
    }
    if (Game.time % 20 === 0) {
        Game.memory.roomCachettl[creep.pos.roomName] = 0
    }
    if (creep.hits / creep.hitsMax < 0.95) {

        if (creep.pos.roomName === posSafe.roomName) {
            Game.war.moveAwayFromSide(creep)
        } else if (creep.pos.roomName === targetRoom) {
            const exitDir = Game.map.findExit(creep.room, safeRoom)
            const exit = creep.pos.findClosestByRange(exitDir)
            creep.moveTo(exit, {ignoreCreeps: false})
        }
    } else {
        creep.moveTo(posTo,{ignoreCreeps:false})
    }
    creep.heal(creep)
    let target = Game.war.getEnemy(creep)[0]
    if (target&&target.pos.getRangeTo(creep)<=3) {
        if (creep.pos.isNearTo(target)) {
            creep.rangedMassAttack()
        } else {
            creep.rangedAttack(target)
        }
    } else {
        target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter: obj => obj.hits && obj.structureType !== STRUCTURE_RAMPART && (!obj.pos.lookFor(LOOK_STRUCTURES).some(obj => obj.structureType === STRUCTURE_RAMPART)) })
        if (!target) target = creep.pos.findClosestByRange(FIND_HOSTILE_CONSTRUCTION_SITES)
        if (!target) target = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: obj => obj.hits && obj.structureType != STRUCTURE_CONTROLLER})
        if (target) {
            if (!target.ticksToLive && creep.pos.getRangeTo(target) <= 1 && !target.progressTotal && (target.structureType ? target.structureType != STRUCTURE_ROAD && target.structureType != STRUCTURE_CONTAINER : true)) {
                creep.rangedMassAttack()
                creep.dismantle(target)
            } else {
                let act = null
                if (target.ticksToLive && target.pos.getRangeTo(creep.pos) <= 1) {
                    act = creep.rangedMassAttack()
                } else {
                    let act = creep.rangedAttack(target)
                }
            }
        }
    }

}

/*
*
25boost heal 540
12tough two times tower
3ranged_attack 90hits


*
* */