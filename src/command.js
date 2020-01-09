
Object.defineProperty(global, 'guns', { get: report_T3 })
Object.defineProperty(global, 'power', { get: report_power })
Object.defineProperty(global, 'energy', { get: report_energy })

function report_power() {
    amountOf('power',true)
}
function report_energy() {
    amountOf('energy',true)
}
function report_T3(){
    for(let type in REACTIONS.X){
        if(type.length==4){
            amountOf(REACTIONS.X[type],false)
        }
    }
}
function amountOf(type,showDetail){
    if(showDetail === undefined || showDetail){
        showDetail = true;
    }else{
        showDetail = false;
    }
    const rooms = _.filter(Game.rooms, (x) => x.controller && x.controller.my && x.terminal)
    var amount = 0;
    rooms.forEach(room => {
        var roomAmount = 0
        roomAmount += room.terminal.store[type]
        if(room.storage){
            roomAmount += room.storage.store[type]
        }
        if(room.factory){
            roomAmount += room.factory.store[type]
        }
        amount += roomAmount;
        if(showDetail)
            console.log(room.name ,'has',roomAmount)
    });
    console.log(type,amount)
    return amount
}