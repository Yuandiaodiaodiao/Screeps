
function missionspawn(spawnnow, types, memory,isonly) {
    let creepname = spawnnow.room.name + "_" + types + "_" + Game.time
    let ans = require(types).born(spawnnow, creepname, memory,isonly)
    return ans
}

function* range(beg, end, step = 1) {
    for (let i = beg; i < end; i += step)
        yield i;
}

module.exports = {
    'range': range,
    'missionspawn': missionspawn
};
