function born(spawnnow, creepname, memory) {
    let bodyparts = require('tools').generatebody({
        'tough': 5,
        'attack': 10,
        'ranged_attack': 10,
        'move': 25,
    }, spawnnow)
    return spawnnow.spawnCreep(
        bodyparts,
        creepname,
        {
            memory: {
                status: 'going',
                missionid: memory.roomName,
            }
        }
    )
}


function work(name) {

    let creep = Game.creeps[name]
    let target = require('tools').findroomselsefilter(Game.rooms[creep.memory.missionid], FIND_HOSTILE_CREEPS, {
        filter: obj => {
            return require('whitelist').whitelist.indexOf(obj.owner.username) == -1
        }
    })[0]
    if (target) {
        if (creep.attack(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target)
        }
        if (creep.pos.getRangeTo(target) <= 1) {
            creep.rangedMassAttack()
        } else {
            creep.rangedAttack(target)
        }
    }


}

module.exports = {
    'work': work,
    'born': born,
};