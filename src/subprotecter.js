function born(spawnnow, creepname, memory) {
    let bodyparts = require('tools').generatebody({
        'move': 12,
        'ranged_attack': 10,
        'heal': 2
    }, spawnnow)
    return spawnnow.spawnCreep(
        bodyparts,
        creepname,
        {
            memory: {
                status: 'fight',
                missionid: memory.roomName,
            }
        }
    )
}


function work(creep) {

    if (creep.memory.status == 'sleep') {
        if (Game.time % 10 == 0) {
            creep.memory.status = 'miss'
            creep.memory._move = undefined
        }
    } else if (creep.memory.status == 'miss') {
        let targets = require('tools').findroomselse(Game.rooms[creep.memory.missionid], FIND_HOSTILE_CREEPS, {
            filter: obj => {
                return require('whitelist').whitelist.indexOf(obj.owner.username) == -1
            }
        }).sort((a, b) => {
            if (a.pos.roomName != b.pos.roomName) return a.pos.roomName > b.pos.roomName ? 1 : -1
            else return a.pos.x - b.pos.x
        })
        if (!targets[0]) {
            creep.memory.status = 'heal'
            return
        }
        const pos = targets[0].pos
        creep.memory.targetpos = [pos.x, pos.y, pos.roomName]
        let target = _.filter(targets, o => {
            return o.pos.roomName == pos.roomName
        }).sort((a, b) => {
            let apoint = (a.getActiveBodyparts('attack') ? 1 : 0) + (a.getActiveBodyparts('heal') ? -1 : 0)
            let bpoint = (b.getActiveBodyparts('attack') ? 1 : 0) + (b.getActiveBodyparts('heal') ? -1 : 0)
            return bpoint - apoint
        })[0]
        // console.log(`room=${creep.pos.roomName} targetslen=${targets.length} target=${JSON.stringify(target)}`)
        if (target) {
            creep.memory.target = target.id
            creep.memory.status = 'go'
        } else {
            creep.memory.status = 'heal'
        }
    }
    if (creep.memory.status == 'go') {
        if (creep.pos.roomName == creep.memory.targetpos[2]) {
            creep.memory.status = 'fight'
        } else {
            const pos = new RoomPosition(...creep.memory.targetpos)
            creep.moveTo(pos, {reusePath: 20})
        }
    }
    if (creep.memory.status == 'fight') {
        let target = Game.getObjectById(creep.memory.target)
        if (target) {
            creep.heal(creep)
            if (creep.pos.getRangeTo(target) >= 3) {
                creep.moveTo(target, {ignoreCreeps: false})
            } else if (creep.pos.getRangeTo(target) <= 1) {
                let ans = PathFinder.search(creep.pos, {pos: target.pos, range: 2}, {
                    plainCost: 1, swampCost: 5, roomCallback: require('tools').roomc, maxRooms: 1, flee: true
                })
                creep.moveByPath(ans.path)
            }
            if (creep.pos.getRangeTo(target) <= 1) {
                creep.rangedMassAttack()
            } else {
                creep.rangedAttack(target)
            }
        } else {
            creep.memory.status = 'miss'
        }
    } else if (creep.memory.status == 'heal' && creep.getActiveBodyparts('heal')) {
        const target = creep.pos.findClosestByPath(FIND_MY_CREEPS, {filter: obj => obj.hits < obj.hitsMax})
        if (target) {
            const act = creep.heal(target)
            if (act == ERR_NOT_IN_RANGE) {
                creep.moveTo(target)
                creep.rangedHeal(target)
            } else {
                try {
                    creep._stand()
                } catch (e) {
                    console.log('creep.prototype.stand erro' + e)
                }
            }


        } else {
            creep.memory.status = 'sleep'
        }

    }


}

function miss(room) {
    if (!room.memory.missions) return
    room.memory.missions.subprotecter = {}
    if (require('tools').findroomselse(room, FIND_HOSTILE_CREEPS, {
        filter: obj => {
            return require('whitelist').whitelist.indexOf(obj.owner.username) == -1
        }
    }).length > 0) {
        room.memory.missions.subprotecter[room.name] = {
            creeps: [],
            roomName: room.name
        }
    } else {
        room.memory.missions.subprotecter = undefined
    }
}

module.exports = {
    'work': work,
    'born': born,
    'miss': miss
};