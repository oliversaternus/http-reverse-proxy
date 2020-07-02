const childProcess = require("child_process");
const path = require("path");
const CronJob = require("cron");
const job = new CronJob("00 00 3 1 * *", function () {
    childProcess.exec("source ./letsencrypt.sh",
        { cwd: path.join(__dirname, "scripts"), shell: "/bin/bash" },
        (err, stdout, stderr) => {
            if (err) {
                console.error(err);
                console.log(stderr);
            }
            console.log(stdout);
        });
});
job.start();