let towerCache = {}
let enemy = {}
let lodash = require('lodash-my')
let attackTimes = {}
let bigEnemy = {}
let damageParts = new Set([RANGED_ATTACK, ATTACK, WORK])

function canDamage(creep) {
    return creep.body.some(bodypart => damageParts.has(bodypart.type))
}

function canHeal(creep) {
    return creep.body.some(bodypart => bodypart.type === HEAL)
}

function work(room) {
    room.memory.tower = room.memory.tower || {}
    let memory = room.memory.tower
    let target = room.find(FIND_HOSTILE_CREEPS)[0]
    enemy[room.name] = !!target;
    let attackSucc
    if (target && target.owner.username !== 'Invader') {
        Memory.grafana.enemy = Memory.grafana.enemy || {}
        Memory.grafana.enemy[room.name + target.owner.username] = Game.time
    }
    if (target) {
        if (room.towers.length === 0) return;

        if (room.spawns.length > 0 && room.spawns.some(o => o.pos.getRangeTo(target.pos) <= 2) && target.owner.username !== 'Invader') {
            room.controller.activateSafeMode()
        }
        bigEnemy[room.name] = !!((require('tower.targetSelecter').isBoost(target.body, 'tough')
            || require('tower.targetSelecter').isBoost(target.body, 'heal')
            || require('tower.targetSelecter').isBoost(target.body, 'attack')) && target.owner.username !== 'Invader')
        if (room.spawns.length > 0 && room.controller.level >= 6 && target.owner.username !== 'Invader' && room.spawns.some(o => o.pos.getRangeTo(target.pos) <= 15)) {
            if (bigEnemy[room.name]) {
                room.controller.activateSafeMode()
            }
        }
    }
    let targets
    if (room.memory.tower.status === 'miss') {

        if (target) {
            targets = room.find(FIND_HOSTILE_CREEPS).sort((a, b) => (room.towers[0].pos.getRangeTo(a.pos)) - (room.towers[0].pos.getRangeTo(b.pos)))
            if (bigEnemy[room.name]) {
                targets.forEach(o => Game.tools.changeCostMatrix(room, o))
            }
            let cansingle = require('tower.targetSelecter').solveCanBeAttack(room, [target])
            if (room.memory.tower.firestatus === 'findHurt') {

            } else if (cansingle || targets.length === 1) {
                room.memory.tower.firestatus = 'single'
            } else if (room.memory.tower.firestatus === 'test') {
                room.memory.tower.firestatus = 'findHurt'
            } else if (targets.length > 1 && (memory.testSleep || 0) < Game.time) {
                room.memory.tower.firestatus = 'test'
            } else {
                room.memory.tower.firestatus = ''
            }
        } else {
            room.memory.tower.firestatus = ''
        }

    } else {
        room.memory.tower.status = 'miss'
    }
    if (room.memory.tower.firestatus === 'single') {
        // console.log('single Attack' + room.name)
        target = require('tower.targetSelecter').solveCanBeAttack(room, [target])
        if (target && (memory.singleSleep || 0) < Game.time) {
            room.visual.text('single', target.pos,
                {color: 'red', lineStyle: 'dashed'})
            for (let tower of room.towers) {
                tower.attack(target)
            }
            attackTimes[target.id] = 1 + (attackTimes[target.id] || 0)
            attackSucc = true
            if (attackTimes[target.id] >= 3 && target.hits === target.hitsMax || (attackTimes[target.id] > 10)) {
                memory.singleSleep = Game.time + Math.floor(Math.random() * 3) + 3
                attackTimes[target.id] = undefined
            }
        } else {
            console.log('sleep time=' + memory.singleSleep)
        }

    } else if (room.memory.tower.firestatus === 'test') {
        console.log('test attack' + room.name)
        let target = targets.find(o => canDamage(o))
        let heal = target.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: o => o.id !== target.id && canHeal(o)})
        if (target) {
            room.visual.text('target', target.pos,
                {color: 'red', lineStyle: 'dashed'})
        }
        if (heal) {
            room.visual.text('heal', heal.pos,
                {color: 'red', lineStyle: 'dashed'})
        }
        memory.bit = memory.bit || 1
        let num = memory.bit
        room.towers.slice(0, memory.bit).forEach(o => o.attack(target))
        room.towers.slice(memory.bit).forEach(o => o.attack(heal))
        if (memory.bit === 1) {
            if (Math.random() > 0.9) {
                memory.bit = room.towers.length - 1
            }
        } else if (Math.random() > 0.9) {
            memory.bit = 1
        }
        attackSucc = true

    } else if (room.memory.tower.firestatus === 'findHurt') {
        console.log('findHurt' + room.name)
        let selecter = require('tower.targetSelecter')
        let hurtCreep = _.min(targets.filter(o => o.hits < o.hitsMax), o => {
            return selecter.checkTough(o.body).hits
        })
        if (hurtCreep && hurtCreep !== Infinity && (!room.memory.tower.findHurtTimes || room.memory.tower.findHurtTimes < 20)
            && (room.memory.tower.lasthits || 5001) > hurtCreep.hits
        ) {
            room.visual.text('hurt', hurtCreep.pos,
                {color: 'red', lineStyle: 'dashed'})
            room.towers.forEach(o => o.attack(hurtCreep))
            attackSucc = true
            room.memory.tower.lasthits = hurtCreep.hits
            room.memory.tower.findHurtTimes = (room.memory.tower.findHurtTimes || 0) + 1

        } else {
            room.memory.tower.lasthits=undefined
            room.memory.tower.findHurtTimes = 0
            memory.firestatus = ''
            memory.testSleep = Game.time + Math.floor(Math.random() * 3) + 3
        }
    }


    if (attackSucc) return

    if ((target = room.find(FIND_MY_CREEPS, {filter: obj => obj.hits < obj.hitsMax})[0])) {
        for (let tower of room.towers) {
            tower.heal(target)
        }
    } else if (Game.time % 20 === 0) {
        let roomenergy = 0
        if (room.storage) {
            roomenergy = room.storage.store[RESOURCE_ENERGY] / room.storage.store.getCapacity()
        }

        target = room.find(FIND_STRUCTURES, {
            filter: obj => {
                if (obj.structureType === STRUCTURE_WALL) return obj.hits < (roomenergy > 0.98 ? 1e7 : 1e5)
                else if (obj.structureType === STRUCTURE_RAMPART) {
                    if (obj.pos.getRangeTo(room.storage) <= 10) {
                        return obj.hits < (roomenergy > 0.98 ? 1e7 : 1e6)
                    } else {
                        return obj.hits < (roomenergy > 0.98 ? 1e7 : 1e6)
                    }
                } else if (obj.structureType === STRUCTURE_ROAD) {
                    return obj.hits <= obj.hitsMax - 800
                } else {
                    return obj.hits < obj.hitsMax
                }

            }
        }).sort((a, b) => {
            return (a.hits - b.hits)
        })
        let num = 0
        let target1 = null
        const twc = towerCache[room.name] = []
        for (let target1 of target) {
            if ((target1.structureType == STRUCTURE_WALL || target1.structureType == STRUCTURE_RAMPART) && room.storage && roomenergy < 0.4) continue
            twc.push(target1.id)
            const tower = room.towers[num]
            if (tower) tower.repair(target1)
            num++
            if (num == 10) break
        }
        let thelp = require('nukeWall').towerHelp[room.name]
        if (thelp > Game.time) {
            let nukeRam = require('nukeWall').towerHelpTarget[room.name]
            if (nukeRam) {
                twc.push(nukeRam)
            }
        }
    } else {
        try {
            const targets = towerCache[room.name] || []
            let target = Game.getObjectById(targets[0])
            while (target) {
                if (target.hits < target.hitsMax) {
                    for (let tower of room.towers) {
                        if (tower.store.getFreeCapacity(RESOURCE_ENERGY) < 500) {
                            tower.repair(target)
                        }
                    }
                    break
                } else {
                    targets.shift()
                    target = Game.getObjectById(targets[0])
                }
            }
        } catch (e) {
            console.log('tower cache error' + e)
        }
    }


}

module.exports = {
    'work': work,
    'enemy': enemy,
    'bigEnemy': bigEnemy
};