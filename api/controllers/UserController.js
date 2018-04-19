/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  getDeepPrognosis: async function(req, res ) {
    console.log(req.params)
    let user = await User.findOne({id: req.params.id}).populate("prognosis")

    if(user) {
      user.prognosis = await Promise.all(user.prognosis.map(async (prognosisItem) => {
        prognosisItem.match = await Match.findOne({id: prognosisItem.match}).populate("firstTeam").populate("secondTeam");
        return prognosisItem
      }))
    } else {
      throw new Error("User does not exists")
    }

    res.json(user.prognosis);
  }

};

