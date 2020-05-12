/*
set http_proxy=http://127.0.0.1:10809
set https_proxy=http://127.0.0.1:10809
*/

function f() {


    var missions = {
        miner: {//挖矿&修复附近的建筑物
            'recid': {
                creeps: ['creepname'],
                target: 'recid',
                container: 'cotid'
            }
        },
        carryer: {//from A transfer to B
            'cotid': {}
        },
        upgrader: {
            'controllerid': {}
        },
        filler: {
            'storageid': {}
        },
        reserver: {
            'roomName': {}
        }
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

    var creeplist = {
        'f': 0,//filler
        'm': 0,//miner
        'c': 0,//carryer
        'u': 0,//upgrader
        'b': 0,//builder
        'r': 0,//reserver

    }

    Object.defineProperties(RoomObject.prototype, {
        /**
         * Prepare an RoomObject by simplify it to {id, pos}
         * @return  {Object}  A simplified object
         */
        simplify: {
            get: function () { // NOTE: Arrow function no "this", cannot use
                return (({
                             id,
                             pos
                         }) => ({
                    id,
                    pos
                }))(this);
            }
        },
        memory: {
            configurable: true,
            get: function () {
                if (_.isUndefined(Memory.roomObjects)) {
                    Memory.roomObjects = {};
                }
                if (!_.isObject(Memory.roomObjects)) {
                    return undefined;
                }
                return (Memory.roomObjects[this.id] = Memory.roomObjects[this.id] || {});
            },
            set: function (value) {
                if (_.isUndefined(Memory.roomObjects)) {
                    Memory.roomObjects = {};
                }
                if (!_.isObject(Memory.roomObjects)) {
                    throw new Error("Could not set room object " + this.id + " memory");
                }
                Memory.roomObjects[this.id] = value;
                Memory.roomObjects[this.id].structureType = this.structureType;
            }
        },
    }


    Object.defineProperties(RoomObject.prototype, {
        memory: {
            configurable: true,
            get: function () {
                if (_.isUndefined(Memory.roomObjects)) {
                    Memory.roomObjects = {};
                }
                if (!_.isObject(Memory.roomObjects)) {
                    return undefined;
                }
                return (Memory.roomObjects[this.id] = Memory.roomObjects[this.id] || {});
            },
            set: function (value) {
                if (_.isUndefined(Memory.roomObjects)) {
                    Memory.roomObjects = {};
                }
                if (!_.isObject(Memory.roomObjects)) {
                    throw new Error("Could not set room object " + this.id + " memory");
                }
                Memory.roomObjects[this.id] = value;
                Memory.roomObjects[this.id].structureType = this.structureType;
            }
        },
    })

    let roada = [
        [11, 49, 'E25N44'],
        [11, 41, 'E25N44'],
        [49, 25, 'E25N44'],
        [39, 12, 'E26N44'],
        [36, 0, 'E26N44'],
        [35, 47, 'E26N45'],
        [35, 46, 'E26N45'],
        [40, 45, 'E26N45'],
        [30, 0, 'E26N45'],
        [40, 45, 'E26N46'],
        [49, 29, 'E26N46'],
        [49, 14, 'E27N46'],
        [8, 12, 'E28N46'],
    ]

    Memory.rooms['E27N42'] = {ctm: [], subroom: [], source: [], missions: {}, tower: [], mineral: []}
}

{
    let link = null
    let linko = Game.getObjectById('5d4946e406b55c2b243f2957')
    let links = ['5d46e98415b5c340931d1232', '5d3ff7f6e9ebc946560a3310', '5d3b0f5655e4f473c8741a81']
    for (let id of links) {
        link = Game.getObjectById(id)
        if (linko && linko.energy == 0 && link && link.cooldown == 0 && link.energy > 200) {
            link.transferEnergy(linko)
            break
        }
    }

    linko = Game.getObjectById('5d3578ad4e9f615e2bd44cac')
    links = ['5d358783c08d9e7cff85ad34', '5d43f8dba95a521e296580e8',]
    for (let id of links) {
        link = Game.getObjectById(id)
        if (linko && linko.energy == 0 && link && link.cooldown == 0 && link.energy > 200) {
            link.transferEnergy(linko)
            break
        }
    }


    linko = Game.getObjectById('5d43d73b73beb779f086718e')
    links = ['5d43cd35c04cb240a53dc1fa', '5d49412ea95d7373b6929fcd']
    for (let id of links) {
        link = Game.getObjectById(id)
        // console.log('link'+link.pos.x+link.pos.y+'energy'+linko.energy+' '+link.energy)
        if (linko && linko.energy == 0 && link && link.cooldown == 0 && link.energy > 200) {
            link.transferEnergy(linko)
            break
        }
    }

    linko = Game.getObjectById('5d4dc36a2086812b4b7511c3')
    links = ['5d4dcd1573beb779f08a5de9']
    for (let id of links) {
        link = Game.getObjectById(id)
        // console.log('link'+link.pos.x+link.pos.y+'energy'+linko.energy+' '+link.energy)
        if (linko && linko.energy == 0 && link && link.cooldown == 0 && link.energy > 200) {
            link.transferEnergy(linko)
            break
        }
    }
}
{


    PathFinder.search(new RoomPosition(27, 12, 'E26N37'), {
        pos: Game.getObjectById('5d423dc1b82e1179ccba5781').pos,
        range: 1
    }, {
        plainCost: 2, swampCost: 10, roomCallback: require('tools').roomc_nocreep
    }).cost
}

{

    Game.getObjectById('5d58a050ea104379d90eb36e').launchNuke(new RoomPosition(20,35,'E31N38'));Game.getObjectById('5d5e20a452d12c73f02d996d').launchNuke(new RoomPosition(11,41,'E31N37'));Game.getObjectById('5d5b0a943a990a6377228922').launchNuke(new RoomPosition(22,30,'E32N36'))
}