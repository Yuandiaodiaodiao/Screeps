/**
 Module: prototype.SpeedUp.getAllOrders
 Author: Yuandiaodiaodiao
 Date:   20200121
 Import:  require('prototype.SpeedUp.getAllOrders')
 usage
 1 . in first of main.js require('prototype.SpeedUp.getAllOrders')
 2 . every tick start exec   Game.market.getAllOrders=require('prototype.SpeedUp.getAllOrders').getAllOrders
 */


let originFun=Game.market.getAllOrders
let ori=function(o){return 0}
module.exports.getAllOrders = function (filter) {
    let js=[JSON.parse,JSON.stringify]
    JSON.parse=ori
    JSON.stringify=ori
    let ans=originFun(filter)
    JSON.parse=js[0]
    JSON.stringify=js[1]
    return ans
}