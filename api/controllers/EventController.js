/**
 * EventController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  getAllMatches: async function (req, res) {
    let matchIdList = []
    const event = await Event.findOne({id: req.params.id}).populate("steps")
    event.steps = await Promise.all(event.steps.map(async (step) => {
      step = await Step.findOne({id: step.id}).populate("matchList")
      step.matchList.map((match) => {
        if (matchIdList.indexOf(match.id) === -1) {
          matchIdList.push(match.id)
        }
      })
      return step
    }))
    let matchList = await Match.find({id: matchIdList}).populate("firstTeam").populate("secondTeam")
    return res.json(matchList)
  }
};

