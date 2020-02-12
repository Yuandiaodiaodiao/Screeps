/**
 Module: prototype.Whitelist
 Author: Yuandiaodiaodiao
 Date:   20200119
 Import:  require('prototype.Whitelist')
 Usage:
 1.write your whiteList in a Set
 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
 2. return your whiteList in function getWhiteList
 3. all find method including Room.find RoomPosition.findClostestByRange/.findInRange/.findClostestByPath and so on
 with param type=== FIND_HOSTILE_CONSTRUCTION_SITES
 FIND_HOSTILE_POWER_CREEPS
 FIND_HOSTILE_CREEPS
 FIND_HOSTILE_SPAWNS
 FIND_HOSTILE_STRUCTURES
 now wont include objects which have owner in your whiteList
 4.use lookForAt / lookForAtArea / LookFor and give the first arg with
 "LOOK_FRIEND"   !!!notice its a string
 will return creep in whiteList (not include yourself)
 "LOOK_HOSTILE"   !!!notice its a string
 will return creep not in whiteList (also not include yourself)

 5.example:
 Game.rooms['E25N43'].lookForAt('LOOK_HOSTILE',25,25)
 Game.rooms['E25N43'].find(FIND_HOSTILE_CREEPS)

 */



//-----a sample of whiteList------------
let whiteList = new Set([
    'o4kapuk',
    'WheatEars',
    'fangxm',
    'czc',
    'EricGuo',
    'qnz'
])

function getWhitelist() {
    //----return your whiteList here-------------------
    return whiteList
}

//------module code------------

let originFind = Room.prototype.find
Room.prototype.find = function (type, opts) {
    let result = originFind.call(this, type, opts)
    if (type === FIND_HOSTILE_CREEPS
        || type === FIND_HOSTILE_CONSTRUCTION_SITES
        || type === FIND_HOSTILE_POWER_CREEPS
        || type === FIND_HOSTILE_SPAWNS
        || type === FIND_HOSTILE_STRUCTURES) {
        result = _.filter(result, o => !getWhitelist().has(o.owner.username))
    }
    return result
}
let originLookForAt = Room.prototype.lookForAt

function isFriend(o) {
    return getWhitelist().has(o.owner.username) && !o.my
}

function isHostile(o) {
    return !getWhitelist().has(o.owner.username) && !o.my
}

Room.prototype.lookForAt = function (type, firstArg, secondArg) {
    if (type === 'LOOK_FRIEND') {
        let result = originLookForAt.call(this, LOOK_CREEPS, firstArg, secondArg)
        result = _.filter(result, isFriend)
        return result
    } else if (type === 'LOOK_HOSTILE') {
        let result = originLookForAt.call(this, LOOK_CREEPS, firstArg, secondArg)
        result = _.filter(result, isHostile)
        return result
    } else {
        return originLookForAt.call(this, type, firstArg, secondArg)
    }
}
let originLookForAtArea = Room.prototype.lookForAtArea

function solveArea(result, asArray, o) {
    if (!asArray) {
        for (let i in result) {
            let temp = result[i]
            for (let j in temp) {
                let tmp = temp[j]
                if (tmp) {
                    tmp = _.filter(tmp, o => getWhitelist().has(o.owner.username) && !o.my)
                }
                if (tmp.length === 0) {
                    temp[i] = undefined
                } else {
                    temp[i] = tmp
                }
            }
        }
    } else {
        result = _.filter(result, o => getWhitelist().has(o.creep.owner.username) && !o.creep.my)
    }
    return result
}

Room.prototype.lookForAtArea = function (type, top, left, bottom, right, asArray) {
    if (type === 'LOOK_FRIEND') {
        let result = originLookForAtArea.call(this, LOOK_CREEPS, top, left, bottom, right, asArray)
        result = solveArea(result, asArray, isFriend)
        return result
    } else if (type === 'LOOK_HOSTILE') {
        let result = originLookForAtArea.call(this, LOOK_CREEPS, top, left, bottom, right, asArray)
        result = solveArea(result, asArray, isHostile)
        return result
    } else {
        return originLookForAtArea.call(this, type, top, left, bottom, right, asArray)
    }
}