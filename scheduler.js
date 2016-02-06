var scheduler = require('node-schedule');
var fs = require('fs');
var path = require('path');
var async = require('async');

// Setting configuration folder
var configDir = path.join(__dirname, 'config');

// Getting config from file
var schedules = JSON.parse(fs.readFileSync(configDir + '/schedule.json', 'utf8'));

async.eachSeries(schedules, function (schedule, callback) {

  var j = scheduler.scheduleJob(schedule.schedule, function(){
    runScript(schedule.job,function(err){
        console.log(err)
    })
  });
})

function runScript(jobName, callback) {

    // keep track of whether callback has been invoked to prevent multiple invocations
    var invoked = false;

    var process = childProcess.fork('app.js ' + jobName);

    // listen for errors as they may prevent the exit event from firing
    process.on('error', function (err) {
        if (invoked) return;
        invoked = true;
        callback(err);
    });

    // execute the callback once the process has finished running
    process.on('exit', function (code) {
        if (invoked) return;
        invoked = true;
        var err = code === 0 ? null : new Error('exit code ' + code);
        callback(err);
    });

}
