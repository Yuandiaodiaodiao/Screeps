
function missionspawn(spawnnow, types, memory,isonly) {
    let creepname = spawnnow.room.name + "_" + types + "_" + Game.time%10000
    try{
        let ans = require(types).born(spawnnow, creepname, memory, isonly)
        return ans
    }catch (e) {
        console.log(`missionspawn error ${creepname} `)
        return -12
    }

}

function* range(beg, end, step = 1) {
    for (let i = beg; i < end; i += step)
        yield i;
}

module.exports = {
    'range': range,
    'missionspawn': missionspawn
};
