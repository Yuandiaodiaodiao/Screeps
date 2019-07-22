function work(nowspawn, name, goalposition) {
    let creep = Game.creeps[name]
    creep.moveTo(goalposition)


    if (creep.pos.roomName == goalposition.roomName) {
        creep.reserveController(creep.room.controller)
    }

}

function born(nowspawn, id) {
    let name = 'r' + id
    nowspawn.spawnCreep(
        [CLAIM,CLAIM, MOVE, MOVE],
        name,
        {
            memory: {}
        }
    );
}

module.exports = {
    'work': work,
    'born': born
};