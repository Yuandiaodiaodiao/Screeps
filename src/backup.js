var missions={
    miner:{//挖矿&修复附近的建筑物
        'recid':{
            creeps:['creepname'],
            target:'recid',
            container:'cotid'
        }
    },
    carryer:{//from A transfer to B
        'cotid':{

        }
    },
    upgrader:{
        'controllerid':{

        }
    },
    filler:{
        'storageid':{

        }
    },
    reserver:{
        'roomName':{

        }
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
        get: function() { // NOTE: Arrow function no "this", cannot use
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
        get: function() {
            if (_.isUndefined(Memory.roomObjects)) {
                Memory.roomObjects = {};
            }
            if (!_.isObject(Memory.roomObjects)) {
                return undefined;
            }
            return (Memory.roomObjects[this.id] = Memory.roomObjects[this.id] || {});
        },
        set: function(value) {
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
        get: function() {
            if (_.isUndefined(Memory.roomObjects)) {
                Memory.roomObjects = {};
            }
            if (!_.isObject(Memory.roomObjects)) {
                return undefined;
            }
            return (Memory.roomObjects[this.id] = Memory.roomObjects[this.id] || {});
        },
        set: function(value) {
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
/*
set http_proxy=http://127.0.0.1:1080
set https_proxy=http://127.0.0.1:1080
*/