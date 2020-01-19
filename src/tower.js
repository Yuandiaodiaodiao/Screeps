var towerCache = {}
let enemy = {}
let lodash = require('lodash-my')


function work(room) {
    let target = room.find(FIND_HOSTILE_CREEPS)[0]
    enemy[room.name] = !!target;
    if (target) {
        Memory.grafana.enemy = Memory.grafana.enemy || {}
        Memory.grafana.enemy[room.name + target.owner.username] = Game.time
    }
    if (target) {
        if (room.spawns.length > 0 && room.spawns.some(o => o.pos.getRangeTo(target.pos) <= 2)) {
            room.controller.activateSafeMode()
        }
    }
    if (target) {
        let targets = room.find(FIND_HOSTILE_CREEPS).sort((a, b) => (room.towers[0].pos.getRangeTo(a.pos)) - (room.towers[0].pos.getRangeTo(b.pos)))

        let target = require('tower.targetSelecter').solveCanBeAttack(room,targets)
        if(!target){
            target=targets[0]
        }
        for (let tower of room.towers) {
            tower.attack(target)
        }
    } else if (target = room.find(FIND_MY_CREEPS,
        {
            filter: obj =>
                obj.hits < obj.hitsMax
        }
    )[0]) {
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
                        return obj.hits < (roomenergy > 0.98 ? 1e8 : 1e6)
                    } else {
                        return obj.hits < (roomenergy > 0.98 ? 1e7 : 1e5)
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
            if ((target1.structureType == STRUCTURE_WALL || target1.structureType == STRUCTURE_RAMPART) && roomenergy < 0.4) continue
            twc.push(target1.id)
            const tower = room.towers[num]
            if (tower) tower.repair(target1)
            num++
            if (num == 10) break
        }
    } else {
        try {
            const targets = towerCache[room.name] || []
            let target = Game.getObjectById(targets[0])
            while (target) {
                if (target.hits < target.hitsMax) {
                    for (let tower of room.towers) {
                        if (tower.store.getFreeCapacity(RESOURCE_ENERGY) < 900) {
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
    'enemy': enemy
};