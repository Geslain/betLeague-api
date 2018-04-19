/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const moment = require("moment")

module.exports = {
  getDeepPrognosis: async function (req, res) {
    let user = await User.findOne({id: req.params.id}).populate("prognosis")

    if (user) {
      user.prognosis = await Promise.all(user.prognosis.map(async (prognosisItem) => {
        prognosisItem.match = await Match.findOne({id: prognosisItem.match}).populate("firstTeam").populate("secondTeam");
        return prognosisItem
      }))
    } else {
      throw new Error("User does not exists")
    }

    res.json(user.prognosis);
  },

  getAllPrognosisMatches: async function (req, res) {
    let user = await User.findOne({id: req.params.id}).populate("groups")
    let matchIdList = []

    if (user) {
      user.groups = await Promise.all(user.groups.map(async (group) => {
        let rooms = await GroupRoom.find({id: group.rooms}).populate("event");
        group.rooms = await Promise.all(rooms.map(async (room) => {
          room.event = await Event.findOne({id: room.event.id}).populate("steps")
          room.event.steps = await Promise.all(room.event.steps.map(async (step) => {
            step = await Step.findOne({id: step.id}).populate("matchList")
            step.matchList.map((match) => {
              if (matchIdList.indexOf(match.id) === -1) {
                matchIdList.push(match.id)
              }
            })
            return step
          }));
          return room
        }));
        return group
      }))
    } else {
      throw new Error("User does not exists")
    }

    let matchList = await Match.find({id: matchIdList}).populate("firstTeam").populate("secondTeam")
    let matchListByDay = []
    await Promise.all(matchList.map(async (match) => {
      const prognosis = await Prognosis.findOne({ match: match.id})
      let matchDay = matchListByDay.find((day) => day.date === match.date)

      if(typeof prognosis !== "undefined") {
        match.firstTeamPrognosis = prognosis.firstTeamPrognosis
        match.secondTeamPrognosis = prognosis.secondTeamPrognosis
      }
      if(!matchDay){
        matchListByDay.push({date: match.date, matchList: [match]})
      } else {
        matchDay.matchList.push(match)
      }
    }))

    matchListByDay.sort((first, second) => {
      const firstDate = moment(first.date,'DD/MM/YYYY');
      const secondDate = moment(second.date,'DD/MM/YYYY');
      if (firstDate.diff(secondDate) < 0) {
        return -1
      } else if (firstDate.diff(secondDate) > 0) {
        return 1
      }
      return 0
    })
    res.json(matchListByDay);
  }
};

