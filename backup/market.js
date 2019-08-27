function f(){

    Game.market.createOrder(ORDER_SELL, RESOURCE_HYDROGEN, 0.098, 20000, "E25N43");
    Game.market.createOrder(ORDER_SELL, RESOURCE_LEMERGIUM, 0.105, 40000, "E27N38");
    Game.market.createOrder(ORDER_SELL, RESOURCE_ZYNTHIUM, 0.05, 56800, "E2742");
    Game.market.createOrder(ORDER_BUY, RESOURCE_HYDROGEN, 0.08, 20000, "E28N46");
Game.market.deal('5d40e1737e28637fd8943222',30000,'E25N43')
    Game.market.changeOrderPrice('5d40796d7e28637fd87d2b3e', 0.098)
    Game.market.cancelOrder('5d3d27247e28637fd8bd1dc8')
    Game.market.extendOrder('5d40e1737e28637fd8943222',30000)
    Game.getObjectById('5d5d2c28b5e0621e0bc0b6c1').send(RESOURCE_KEANIUM,6000,'E28N46')
}
