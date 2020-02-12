/**
 Module: prototype.SpeedUp.getAllOrders
 Author: Yuandiaodiaodiao
 Date:   20200122
 Import:  require('prototype.SpeedUp.getAllOrders')
 usage
 1 . in first of main.js require('prototype.SpeedUp.getAllOrders')
 2 . every tick start exec     require('prototype.SpeedUp.getAllOrders').load()
 */


let originFun = Game.market.getAllOrders
let origingetOrderById = Game.market.getOrderById
let ori = function (o) {
    return o
}
const getAllOrders = function (filter) {
    let js = [JSON.parse, JSON.stringify]
    JSON.parse = ori
    JSON.stringify = ori
    let ans = originFun(filter)
    JSON.parse = js[0]
    JSON.stringify = js[1]
    return ans
}
const getOrderById = function (id) {
    let js = [JSON.parse, JSON.stringify]
    JSON.parse = ori
    JSON.stringify = (o) => {
        if (o.price) {
            o.price *= 1000
        }
        return o
    }
    let ans = originFun(id)
    JSON.parse = js[0]
    JSON.stringify = js[1]
    return ans
}
module.exports.load = function () {
    Game.market.getAllOrders = getAllOrders
    Game.market.getOrderById = getOrderById
}