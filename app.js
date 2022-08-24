// require dotenv
const dotenv = require('dotenv');
const moment = require('moment');
const fs = require('fs');
const exec = require('child_process').exec;

// load env
dotenv.config();
// get env
const DB_HOST = process.env.DB_HOST
const DB_NAME = process.env.DB_NAME
const ROMOTE_PASSWORD = process.env.ROMOTE_PASSWORD;
const SSH_PORT = process.env.SSH_PORT;
const REMOTE_USER = process.env.REMOTE_USER;

const CUR_DIR = process.cwd();
// get current date with date format
const date = moment().format('YYYY-MM');

let backup_dir = CUR_DIR + '/backup/';
// check if today's backup dir exists
if (!fs.existsSync(backup_dir)) {
    fs.mkdirSync(backup_dir);
} else {
    console.log('today dir exists');
}


const table_list = CUR_DIR + '/tablelist.txt';

// read file
fs.readFile(table_list, 'utf8', function (err, data) {
    if (err) throw err;
// for in
    var tbl = '';
    for (var i in data.split('\n')) {
        var table = data.split('\n')[i];
        tbl += ' ' + table;
    }
    var cmd = 'mysqldump -h ' + DB_HOST + ' -u root -p123456 --databases ' + DB_NAME + ' --tables ' + tbl + ' > ' +
        backup_dir + DB_NAME + '.sql';
    console.log(cmd);
    let backup_file = backup_dir + DB_NAME + '.sql';

    exec(cmd, function (error) {
        if (error !== null) {
            console.log('exec error: ' + error);
        }
        compress(backup_file);
    });

});

// compress with gzip exec
function compress(backup_file) {
    let cmd = 'gzip ' + backup_file;
    console.log(cmd);
    exec(cmd, function (error) {
            if (error !== null) {
                console.log('exec error: ' + error);
            }
        }
    );
    let backup_file_gz = DB_NAME + '.sql.gz';
    upload(backup_file_gz);
}

// upload to server
function upload(backup_file_gz) {
    let cmd = 'sshpass -p \"' + ROMOTE_PASSWORD + '\" scp -P ' + SSH_PORT + ' $(pwd)/backup/' + backup_file_gz + ' ' + REMOTE_USER
    + ':/var/backup/';
    console.log(cmd);
    exec(cmd, function (error) {
        if (error !== null) {
            console.log('exec error: ' + error);
        }
    }
    );
}

