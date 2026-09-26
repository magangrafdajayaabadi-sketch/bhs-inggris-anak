/* GET /api/status — apakah mode server (database) aktif? */
const { serverMode, send } = require("./_lib.js");

module.exports = async (req, res) => {
  send(res, 200, { server: serverMode() });
};
