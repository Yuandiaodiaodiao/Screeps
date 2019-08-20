module.exports = {
    'findrooms': findrooms,
    'generatebody': generatebody,
    'deepcopy':deepcopy,
    'findroomsfilter':findroomsfilter,
    'randomNum':randomNum,
    'findroomselse':findroomselse,
    'findroomselsefilter':findroomselsefilter
};

function* range(beg, end, step = 1) {
    for (let i = beg; i < end; i += step)
        yield i;
}

function findroomselse(room, findconst) {
    let roomset = new Set(Memory.rooms[room.name].subroom)
    let ans = []
    for (let name in Game.rooms) {
        if (roomset.has(name)) {
            ans = ans.concat(Game.rooms[name].find(findconst))
        }
    }
    return ans
}
function findroomselsefilter(room, findconst,filters) {
    let roomset = new Set(Memory.rooms[room.name].subroom)
    let ans = []
    for (let name in Game.rooms) {
        if (roomset.has(name)) {
            ans = ans.concat(Game.rooms[name].find(findconst,filters))
        }
    }
    return ans
}
function findrooms(room, findconst) {
    let roomset = new Set(Memory.rooms[room.name].subroom)
    roomset.add(room.name)
    let ans = []
    for (let name in Game.rooms) {
        if (roomset.has(name)) {
            ans = ans.concat(Game.rooms[name].find(findconst))
        }
    }
    return ans
}
function findroomsfilter(room,findconst,filters) {
    let roomset = new Set(Memory.rooms[room.name].subroom)
    roomset.add(room.name)
    let ans = []
    for (let name in Game.rooms) {
        if (roomset.has(name)) {
            ans = ans.concat(Game.rooms[name].find(findconst,filters))
        }
    }
    return ans
}
function bodycost(body) {
    let nowcost=0
    for(let part in body){
        nowcost+=Math.ceil(body[part])*BODYPART_COST[part]
    }
    return nowcost
}
function generatebody(body,spawnnow=null) {
    let maxpart=0
    for(let part in body){
        maxpart+=Math.ceil(body[part])
    }
    while(maxpart>50){
        let fix=49.9/maxpart
        maxpart=0
        for(let part in body){
            body[part]*=fix
            maxpart+=Math.ceil(body[part])
        }
    }
    if(spawnnow){
        let maxenergy=spawnnow.room.energyCapacityAvailable
        while(bodycost(body)>maxenergy){
            let maxbody=-1
            for(let part in body){
                body[part]/=1.2
                maxbody=Math.max(Math.ceil(body[part]),maxbody)
            }
            if(maxbody==1)break
        }
    }
    let bodyarray = []
    for (let part in body) {
        for (let i of range(0, Math.ceil(body[part]))) {
            bodyarray.push(part)
        }
    }
    return bodyarray
}
function deepcopy(obj){
    let _obj = JSON.stringify(obj),
        objClone = JSON.parse(_obj);
    return objClone
}
function randomNum(minNum,maxNum){
    switch(arguments.length){
        case 1:
            return parseInt(Math.random()*minNum+1,10);
            break;
        case 2:
            return parseInt(Math.random()*(maxNum-minNum+1)+minNum,10);
            break;
        default:
            return 0;
            break;
    }
}