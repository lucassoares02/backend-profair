const connection = require("./../config/server");

async function Execute(params) {
    console.log("Function Execute");
    return new Promise(function (resolve, reject) {
        return connection.query(params, function (error, results, fields) {
            console.log(results);
            console.log(error);
            console.log(fields);
            if (error) return false;
            return true;
        });
    });

}

module.exports = Execute;
