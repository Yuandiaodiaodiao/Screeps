/**
 *
 * usage:
 * require("buyOrder").work()  in your main loop
 */


//手操变量
const tokenorder = "5edf6bcd7c5ed16932b37232"
const minTokenPrice = 12e6
let nextTickDo=[]
function buyPixel(){
    const pxOrders = Game.market.getAllOrders({type: ORDER_SELL, resourceType: "pixel"})
    const cheapestOrder = _.min(pxOrders, order => order.price)
    const cr = Game.market.credits
    // console.log(`找到token价格为 ${cheapestToken.price}`)
    if (cheapestOrder && cheapestOrder.price <= 600&& cr>1e6) {
        Game.market.deal(cheapestOrder.id, cheapestOrder.amount)
    }
}
module.exports.work = function () {
    buyPixel()
    return;
    //没钱就别买了
    if (Game.market.credits < minTokenPrice) return
    nextTickDo.forEach(o=>o())
    nextTickDo=[]
    const tokenOrders = Game.market.getAllOrders({type: ORDER_SELL, resourceType: SUBSCRIPTION_TOKEN})

    let tokenOrderPrice
    try {
        tokenOrderPrice = changeTokenOrder(tokenOrders)
    } catch (e) {
        console.log("changeTokenOrder error" + e)

    }
    if (tokenOrderPrice) {
        try {
            buyToken(tokenOrders, tokenOrderPrice)
        } catch (e) {
            console.log("buyToken error" + e)
        }
    }
}
let lastIncreaseTick = -1
let increaseInverval = -1

function changeTokenOrder(tokenOrders) {
    const myOrder = Game.market.getOrderById(tokenorder) || getMyTokenOrder()
    if (!myOrder) return
    const enemyToken = getTopOrderToken()
    // console.log(`myOrder price=${myOrder.price} enemyToken price=${enemyToken.price}`)
    if (!enemyToken) {
        //没有其他单子了
        return
    }
    const cr = Game.market.credits
    //相等的价格也要加上一点
    const deltaPrice = enemyToken.price - myOrder.price + 0.001
    const deltaMarketFee = deltaPrice * myOrder.amount * 0.05
    const ifCanIncrease=cr - deltaMarketFee >= myOrder.price + deltaPrice + 0.001
    //上一次是5 间隔5 这次是10
    if (Game.time === lastIncreaseTick + increaseInverval) {
        //预测将要在下1tick发动涨价
        if(ifCanIncrease){
            console.log(`预测涨价${Game.time%1000} interval=${increaseInverval}`)
            Game.market.changeOrderPrice(myOrder.id, myOrder.price+0.001)
            // nextTickDo.push((()=>{
            //     let lastPrice=enemyToken.price
            //     let obOrder=enemyToken.id
            //     return ()=>{
            //         let nowOrder=Game.market.getOrderById(obOrder)
            //         if(!nowOrder)return
            //         let nowPrice=nowOrder.price
            //         if(nowPrice>lastPrice){
            //             //确实涨价了
            //             increaseInverval=(Game.time-1)-lastIncreaseTick
            //             lastIncreaseTick=Game.time-1
            //             console.log(`确实涨价了 修正interval=${increaseInverval}`)
            //         }else{
            //             increaseInverval=-1
            //         }
            //     }
            // })())
        }
    }
    if (enemyToken.price < myOrder.price || enemyToken.id === myOrder.id) {
        //已经是最高价了
        return myOrder.price;
    }


    if (ifCanIncrease &&deltaPrice>0 ) {
        //5tick涨价 6tick发现涨价 last=5  11tick发现涨价 11-1-5=5
        //要买得起 才能加价
        // console.log(`内卷 加价到${myOrder.price + deltaPrice}`)
        Game.market.changeOrderPrice(myOrder.id, myOrder.price + deltaPrice)
        increaseInverval = (Game.time-1)- lastIncreaseTick
        //敌人在上1tick涨价
        console.log(`检测到在${(Game.time-1)%1000} 涨价 上次涨价时间为${lastIncreaseTick} interval=${increaseInverval}`)

        lastIncreaseTick = Game.time-1
        return myOrder.price + deltaPrice
    }
    return enemyToken.price

}

function buyToken(tokenOrders, tokenOrderPrice) {
    const tokens = tokenOrders
    const cheapestToken = _.min(tokens, order => order.price)
    const cr = Game.market.credits
    // console.log(`找到token价格为 ${cheapestToken.price}`)
    if (cheapestToken && cheapestToken.price <= cr && 0 < tokenOrderPrice) {
        Game.market.deal(cheapestToken.id, 1)
    }
}

function getTopOrderToken() {
    const tokens = Game.market.getAllOrders({type: ORDER_BUY, resourceType: SUBSCRIPTION_TOKEN})
    const topToken = _.max(tokens, order => {
        return order.id === tokenorder ? -1 : order.price
    })
    return topToken
}

function getMyTokenOrder() {
    const tokenOrders = _.filter(Object.values(Game.market.orders), {
        type: ORDER_BUY,
        resourceType: SUBSCRIPTION_TOKEN,
        active: true
    })
    const myTopOrder = _.max(tokenOrders, order => order.price)
    return myTopOrder
}

module.exports.getMyTokenOrder = getMyTokenOrder
