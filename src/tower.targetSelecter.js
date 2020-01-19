/**
 Module: tower.targetSelecter
 Author: Yuandiaodiaodiao
 Date:   20200119

 Usage:
    first you need import module prototype.Room.structures (it has write in 	code annotation bottom)
    second require('tower.targetSelecter').solveCanBeAttack(room,targets)
    @param room:your room object
    @param targets: an array list creeps you want to attack :  [creep1,creep2,creep3]
    @return target / undefined
    when the module find an attackable target it will return
    or if all targets cant be defeat it will return undefined
 log
 v1.1 fix big bug
 */

function solvedamage(dist) {
    if (dist <= 5) return 600
    else if (dist <= 20) return 600 - (dist - 5) * 30
    else return 150
}

function getheal(body) {
    let healnumber = 0
    for (let part of body) {
        if (part.type === 'heal') {
            if (!part.boost)
                healnumber += 12
            else {
                healnumber += BOOSTS.heal[part.boost].heal * 12
            }
        }
    }
    return healnumber
}

function checkTough(body) {
    let hits = 0
    let damagerate = 1
    let num = 0
    for (let part of body) {
        if (part.type === 'tough') {
            if (part.boost){
                hits += 100 / BOOSTS.tough[part.boost].damage
                damagerate += BOOSTS.tough[part.boost].damage
                num++
            }else{
                break
            }
        }
    }
    return {
        "hits": hits,
        'damage': damagerate / (num === 0 ? 1 : num)
    }
}

function solveCanBeAttack(room, targets) {
    for (let target of targets) {
        let towerattack = 0
        room.towers.forEach(o =>
            towerattack += solvedamage(o.pos.getRangeTo(target.pos))
        )

        let healNumber = 0
        target.pos.findInRange(FIND_HOSTILE_CREEPS, 1).forEach(o =>
            healNumber += getheal(o.body))

        let tough = checkTough(target.body)
        if (healNumber === 0 || healNumber < towerattack * tough.damage || towerattack > tough.hits) {
            return target
        }
    }
    return undefined
}

module.exports.solveCanBeAttack = solveCanBeAttack

//---------module prototype.Room.structures-----------
/**
 Module: prototype.Room.structures v1.7
 Author: SemperRabbit
 Date:   20180309-13,0411
 Usage:  require('prototype.Room.structures');

 This module will provide structure caching and extends the Room
 class' prototype to provide `room.controller`-like properties
 for all structure types. It will cache the object IDs of a
 room.find() grouped by type as IDs in global. Once the property
 is requested, it will chech the cache (and refresh if required),
 then return the appropriate objects by maping the cache's IDs
 into game objects for that tick.

 Changelog:
 1.0: Initial publish
 1.1: Changed multipleList empty results from `null` to `[]`
 Bugfix: changed singleList returns from arrays to single objects or undefined
 1.2: Added intra-tick caching in addition to inter-tick caching
 1.3: Multiple bugfixes
 1.4: Moved STRUCTURE_POWER_BANK to `multipleList` due to proof of *possibility* of multiple
 in same room.
 1.5: Added CPU Profiling information for Room.prototype._checkRoomCache() starting on line 47
 1.6: Added tick check for per-tick caching, in preperation for the potential "persistent Game
 object" update. Edits on lines 73, 77-83, 95, 99-105
 1.7; Added Factory support (line 46)
 */
/**


 var roomStructures           = {};
 var roomStructuresExpiration = {};

 const CACHE_TIMEOUT = 100;
 const CACHE_OFFSET  = 4;

 const multipleList = [
 STRUCTURE_SPAWN,        STRUCTURE_EXTENSION,    STRUCTURE_ROAD,         STRUCTURE_WALL,
 STRUCTURE_RAMPART,      STRUCTURE_KEEPER_LAIR,  STRUCTURE_PORTAL,       STRUCTURE_LINK,
 STRUCTURE_TOWER,        STRUCTURE_LAB,          STRUCTURE_CONTAINER,	STRUCTURE_POWER_BANK,
 ];

 const singleList = [
 STRUCTURE_OBSERVER,     STRUCTURE_POWER_SPAWN,  STRUCTURE_EXTRACTOR,	STRUCTURE_NUKER,
 //STRUCTURE_TERMINAL,   STRUCTURE_CONTROLLER,   STRUCTURE_STORAGE,
 ];

 if(global.STRUCTURE_FACTORY !== undefined) singleList.push(STRUCTURE_FACTORY);

 function getCacheExpiration(){
    return CACHE_TIMEOUT + Math.round((Math.random()*CACHE_OFFSET*2)-CACHE_OFFSET);
}


Room.prototype._checkRoomCache = function _checkRoomCache(){
    // if cache is expired or doesn't exist
    if(!roomStructuresExpiration[this.name] || !roomStructures[this.name] || roomStructuresExpiration[this.name] < Game.time){
        roomStructuresExpiration[this.name] = Game.time + getCacheExpiration();
        roomStructures[this.name] = _.groupBy(this.find(FIND_STRUCTURES), s=>s.structureType);
        var i;
        for(i in roomStructures[this.name]){
            roomStructures[this.name][i] = _.map(roomStructures[this.name][i], s=>s.id);
        }
    }
}

multipleList.forEach(function(type){
    Object.defineProperty(Room.prototype, type+'s', {
        get: function(){
            if(this['_'+type+'s'] && this['_'+type+'s_ts'] === Game.time){
                return this['_'+type+'s'];
            } else {
                this._checkRoomCache();
                if(roomStructures[this.name][type]) {
                    this['_'+type+'s_ts'] = Game.time;
                    return this['_'+type+'s'] = roomStructures[this.name][type].map(Game.getObjectById);
                } else {
                    this['_'+type+'s_ts'] = Game.time;
                    return this['_'+type+'s'] = [];
                }
            }
        },
        set: function(){},
        enumerable: false,
        configurable: true,
    });
});

singleList.forEach(function(type){
    Object.defineProperty(Room.prototype, type, {
        get: function(){
            if(this['_'+type] && this['_'+type+'_ts'] === Game.time){
                return this['_'+type];
            } else {
                this._checkRoomCache();
                if(roomStructures[this.name][type]) {
                    this['_'+type+'_ts'] = Game.time;
                    return this['_'+type] = Game.getObjectById(roomStructures[this.name][type][0]);
                } else {
                    this['_'+type+'_ts'] = Game.time;
                    return this['_'+type] = undefined;
                }
            }
        },
        set: function(){},
        enumerable: false,
        configurable: true,
    });
});
*/

