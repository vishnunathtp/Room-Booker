const db = require("./db");

function getRooms(callback) {
    const sql = "SELECT * FROM rooms";

    db.query(sql, callback);
}

module.exports = {
    getRooms
};