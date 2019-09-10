var http = require('http'),
    path = require('path'),
    ncp = require('ncp').ncp,
    clone = require('git-clone'),
    fs = require('fs');

// Default page
exports.renderHome = function(req, res) {
    if (req.session.lastVisit) {
        console.log(req.session);
        console.log(req.session.id);
    }
    req.session.lastVisit = new Date();
    res.render('home');
};

exports.getSessionId = function(req, res, next) {
    res.send(req.session.id)
}

exports.mkRecordDir = function(req, res, next) {
    req.recordpath = path.dirname(require.main.filename) + '/public/data/' + req.session.id;
    req.recordfilepath = req.recordpath+"/outputfile.m4v";
    if (!fs.existsSync(req.recordpath)) {
        fs.mkdirSync(req.recordpath);
        console.log(req.recordpath + ' created');
        next();
    }else{
        console.log(req.recordpath + ' already exists');
        next();
    }
}

var sanatize = function(duration) {
    var d = parseInt(duration);
    if(d<10){
        return '0'+duration;
    }
    else{
        return duration;
    }
}

exports.runStreamer = function(req, res, next) {
    var streamer = require('child_process').spawn(
        'streamer', ["-q","-c","/dev/video0","-f","rgb24","-r","3","-t","00:00:"+sanatize(req.query.duration),"-o",req.recordpath+"/outfile.avi"]
    );
    var output = "";
    streamer.stdout.on('data', function(data) { output += data;});
    streamer.on('close', function(code) {
        console.log('done recording');
        next();
    });
}
//HandBrakeCLI -i outfile.avi -o out.m4v -e x264 -r 15 -b 128 -B 32 -R44.1 -X 320 -Y 140
exports.convertAvi2Mp4 = function(req, res, next) {
    var avconv = require('child_process').spawn(
        'HandBrakeCLI', ["-i",req.recordpath+"/outfile.avi","-o",req.recordfilepath,"-e","x264","-r","15","-b","128","-B","32","-R44.1","-X","320","-Y","140"]
    );
    var output = "";
    avconv.stdout.on('data', function(data) { output += data;});
    avconv.on('close', function(code) {
        console.log('done converting avi to mp4');
        next();
    });
}

exports.mkPoseDir = function(req, res, next) {
    var posepath = req.query.recordpath + '/poses';
    req.query.posepath = posepath;
    if (!fs.existsSync(posepath)) {
        fs.mkdirSync(posepath);
        console.log(posepath + ' created');
        next();
    }
}

exports.runCPM = function(req, res, next) {
    req.query.csvpath = req.query.repopath + '/motion.csv';
    var cpmpath = path.dirname(require.main.filename) + '/cpm';
    var cpm = require('child_process').spawn(
        'sh', [cpmpath, req.query.repopath+'/outfile.avi', req.query.posepath, req.query.csvpath]
    );
    var output = "";
    cpm.stdout.on('data', function(data) { output += data;});
    cpm.on('close', function(code) {
        console.log('pose and motion csv generated');
        next();
    });
}

exports.runClassifier = function(req, res, next) {
    var classifierpath = path.dirname(require.main.filename) + '/classifier';
    var classifier = require('child_process').spawn(
        'python', [classifierpath+'/test.py',
            req.query.csvpath
        ]
    );
    var output = "";
    classifier.stdout.on('data', function(data) { output += data;});
    classifier.on('close', function(code) {
        console.log('classification done');
        req.query.outputdistribution = JSON.parse(output);
        next();
    });
}