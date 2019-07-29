function born(spawnnow, creepname, memory) {
    let bodyparts = require('tools').generatebody({
        'tough':3,
        'move': 6,
        'attack': 3,
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
    let target=require('tools').findroomselse(Game.rooms[creep.memory.missionid], FIND_HOSTILE_CREEPS)[0]
    if(target&& creep.attack(target)==ERR_NOT_IN_RANGE){
        creep.moveTo(target)
    }

}

module.exports = {
    'work': work,
    'born': born,
};