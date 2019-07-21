var miner = require('miner');
var api = require('api');
var carryer = require('carryer');
var upgrader = require('upgrader');
var builder = require('builder');
var tower = require('tower');
var creepsnum = 7;
var range = api.range;
var spawnnow = Game.spawns['spawn1']
var creeplist = {
    'm': 2,//miner
    'c': 3,//carryer
    'u': 2,//upgrader
    'b': 2,//builder
}


function renew(spawns) {
    if (spawns.spawning) return
    for (let types in creeplist) {
        for (let i of range(0, creeplist[types])) {
            if (!Game.creeps.hasOwnProperty(types + i)) {
                api.spawn(spawns, types, i)
                return
            }
        }
    }


}


module.exports.loop = function () {
    spawnnow = Game.spawns["spawn1"]
    renew(spawnnow)

    for (let i in Memory.structure.container.mine) {
        Memory.creeps["c" + i].gettarget
            = Memory.structure.container.mine[i]
    }
    for (let name in Game.creeps) {
        if (name[0] == 'm') {
            miner.mine(spawnnow, name);
        } else if (name[0] == 'c') {
            if (name[1] == '2')
                carryer.work2(spawnnow, name)
            else
                carryer.work(spawnnow, name)
        } else if (name[0] == 'u') {
            upgrader.work(spawnnow, name)
        } else if (name[0] == 'b') {
            if (name[1] == '0')
                builder.work(spawnnow, name)
            else
                builder.work2(spawnnow, name)
        }
    }
    let towers = spawnnow.room.find(FIND_STRUCTURES,
        {
            filter: obj => obj.structureType == STRUCTURE_TOWER
        })
    if (towers.length > 0) {
        for (let i in towers) {
            tower.work(spawnnow, towers[i])
        }
    }


}