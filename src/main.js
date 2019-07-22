var miner = require('miner');
var api = require('api');
var carryer = require('carryer');
var upgrader = require('upgrader');
var builder = require('builder');
var tower = require('tower');
var reserver=require('reserver')
var creepsnum = 7;
var range = api.range;
var spawnnow = Game.spawns['spawn1']
var creeplist = {
    'm': 3,//miner
    'c': 5,//carryer
    'u': 1,//upgrader
    'b': 1,//builder
    'r':1,//reserver
}
var findrooms = require('tools').findrooms

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


    for (let name in Game.creeps) {
        if (name[0] == 'm') {
            miner.mine(spawnnow, name);
        } else if (name[0] == 'c') {
            if (name[1] >='3')
                carryer.work2(spawnnow, name)
            else
                carryer.work(spawnnow, name)
        } else if (name[0] == 'u') {
            upgrader.work(spawnnow, name)
        } else if (name[0] == 'b') {
            if (name[1] <= '1')
                builder.work2(spawnnow, name)
            else
                builder.work(spawnnow, name)
        }else if(name[0]=='r'){
            let pos=new  RoomPosition(10, 25, 'E25N42')
            reserver.work(spawnnow,name,pos)
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