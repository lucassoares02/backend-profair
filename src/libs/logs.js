const { connection } = require("@server");

async function saveLogs(user, action, platform) {
    console.log("salvando os logs")
    const query = `INSERT INTO logs (user, action, platform) VALUES (${user}, '${action}', '${platform}')`;
    try {
        return await connection.query(query, (error, results, fields) => {
            if (error) return false;
            return true;
        });
    } catch (error) {
        console.log(error);
    }

}

module.exports = saveLogs;
