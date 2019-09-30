var MissionCache = {}
module.exports.detector = mission_detector

function mission_detector() {
    MissionCache = {}
    Object.values(Game.creeps).forEach(creep => {
        try {
            const [roomName, role] = creep.name.split('_')
            const room = MissionCache[roomName] = MissionCache[roomName] || {}
            const missions = room[role] = room[role] || {}
            const mission = missions[creep.memory.missionid] = missions[creep.memory.missionid] || []
            if (creep.id) {
                mission.push(creep.id)
            }
        } catch (e) {
            console.log('missioncache' + e)
        }
    })


}
