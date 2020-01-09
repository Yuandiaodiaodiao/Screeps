/*
creep对穿
拒绝堵车从你做起
author: Yuandiaodiaodiao
data:2019/10/21
version:1.2
Usage:
module :main

require('prototype.Creep.move')
module.exports.loop=function(){
     require('prototype.Creep.move').moveCache.clear()

     //your codes go here


}

ps:
1.如果想进行非对穿寻路
creep.moveTo(target,{ignoreCreeps:false})

 */
var config = {
    changemove: true,//实现对穿
    changemoveTo: true,//优化moveTo寻路默认使用ignoreCreep=true
    roomCallbackWithoutCreep:undefined,//moveTo默认使用的忽视creep的callback函数
    roomCallbackWithCreep: undefined,//moveTo默认使用的计算creep体积的callback函数
    changeFindClostestByPath: true,  //修改findClosestByPath 使得默认按照对穿路径寻找最短
    reusePath: 5 //增大默认寻路缓存
}

var moveCache = new Set()
var lastMove = {}
module.exports.moveCache = moveCache
module.exports.lastMove = lastMove
if (config.changemove) {
    if (!Creep.prototype._move) {
        // Store the original method
        Creep.prototype._move = Creep.prototype.move
        // Create our new function
        Creep.prototype.move = function (target) {
            moveCache.add(this.name)
            const direction = +target
            const thisarray = [this.pos.x, this.pos.y, direction, Game.time]
            const lastM = lastMove[this.name] = lastMove[this.name] || thisarray
            if ((this.room.storage && this.pos.getRangeTo(this.room.storage.pos) < 10) || (lastM[0] === this.pos.x && lastM[1] === this.pos.y && lastM[3] + 1 === Game.time && lastM[2] === direction) || (this.pos.x <= 1 || this.pos.x >= 49 || this.pos.y <= 1 || this.pos.y >= 49)) {
                const tarpos = pos2direction(this.pos, direction)
                if (tarpos) {
                    const tarcreep = tarpos.lookFor(LOOK_CREEPS)[0] || tarpos.lookFor(LOOK_POWER_CREEPS)[0]
                    if (tarcreep && !moveCache.has(tarcreep.name)) {
                        moveCache.add(tarcreep.name)
                        tarcreep._move((direction + 3) % 8 + 1)
                    }
                }
            }
            lastMove[this.name] = thisarray
            return this._move(target)
        }

    }
    if (!PowerCreep.prototype._move) {
        PowerCreep.prototype._move = function (target) {
            if (!this.room) {
                return ERR_BUSY
            }
            return Creep.prototype._move.call(this, target)
        }
    }
}
if (config.changemoveTo) {
    if (!Creep.prototype._moveTo) {
        Creep.prototype._moveTo = Creep.prototype.moveTo
        Creep.prototype.moveTo = function (firstArg, secondArg, opts) {
            let ops = {}
            if (_.isObject(firstArg)) {
                ops = secondArg || {}
            } else {
                ops = opts || {}
            }
            if (!ops.reusePath) {
                ops.reusePath = config.reusePath
            }
            if (ops.ignoreRoads) {
                ops.plainCost = 1
                ops.swampCost = 5
            }
            if (ops.ignoreCreeps === undefined || ops.ignoreCreeps === true) {
                ops.ignoreCreeps = true
                ops.costCallback = config.roomCallbackWithoutCreep
            } else {
                ops.costCallback = config.roomCallbackWithCreep
            }

            if (_.isObject(firstArg)) {
                return this._moveTo(firstArg, ops)
            } else {
                return this._moveTo(firstArg, secondArg, ops)
            }
        }
    }

    if (!PowerCreep.prototype._moveTo) {
        PowerCreep.prototype._moveTo = function (firstArg, secondArg, opts) {
            if (!this.room) {
                return ERR_BUSY
            }
            let ops = {}
            if (_.isObject(firstArg)) {
                ops = secondArg || {}
            } else {
                ops = opts || {}
            }
            if (!ops.reusePath) {
                ops.reusePath = 20
            }
            ops.plainCost = 1
            ops.swampCost = 1
            if (_.isObject(firstArg)) {
                return Creep.prototype._moveTo.call(this, firstArg, ops)
            } else {
                return Creep.prototype._moveTo.call(this, firstArg, secondArg, ops)
            }
        }
    }
}

if (config.changeFindClostestByPath) {
    if (!RoomPosition.prototype._findClosestByPath) {
        RoomPosition.prototype._findClosestByPath = RoomPosition.prototype.findClosestByPath
        RoomPosition.prototype.findClosestByPath = function (type, opts) {
            opts = opts || {}
            if (opts.ignoreCreeps === undefined || opts.ignoreCreeps === true) {
                opts.ignoreCreeps = true
                opts.costCallback = config.roomCallbackWithoutCreep
            } else {
                opts.costCallback = config.roomCallbackWithCreep
            }
            return this._findClosestByPath(type, opts)
        }
    }
}

function pos2direction(pos, direction) {
    let tarpos = {
        x: pos.x,
        y: pos.y,
    }
    if (direction !== 7 && direction !== 3) {
        if (direction > 7 || direction < 3) {
            --tarpos.y
        } else {
            ++tarpos.y
        }
    }
    if (direction !== 1 && direction !== 5) {
        if (direction < 5) {
            ++tarpos.x
        } else {
            --tarpos.x
        }
    }
    if (tarpos.x < 0 || tarpos.y > 49 || tarpos.x > 49 || tarpos.y < 0) {
        return undefined
    } else {
        return new RoomPosition(tarpos.x, tarpos.y, pos.roomName)

    }
}