var fs = require('fs');
var request = require('request');
var _ = require('underscore');
var path = require('path');
var prettysize = require('prettysize');
var progressStream = require('progress-stream');
var crypto = require('crypto');
var prettyTime = require('pretty-time');
var Email = require('./Email');

module.exports = {
    lists: (req, res, next) => {
        req.service.files.list({
            pageSize: 10,
            // fields: " files(id, name,corpus)"
        }, (err, response)=> {
            if (err) {
                console.log(err);
                return res.json(req.error("Error while fetching lists from drive"));
            }
            var dir = _.where(response.files, {mimeType: 'application/vnd.google-apps.folder'});
            return res.json(req.success(dir));
        });
    },
    upload: (req, res)=> {
        console.log("Socket id is " + req.cookies.id);
        email = new Email();
        if (req.query.email) {
            email.setFrom("Samundra Kc");
            email.setTo(req.query.email);
        }

        var current_client;
        if (req.cookies.id) {
            current_client = _.findWhere(clientLists, {id: req.cookies.id});
        }

        if (!req.query.url) {
            return res.json(req.error("No any url found"));
        }

        var options = {
            url: ' https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
            headers: {},
        }

        var progress = progressStream({
            time: 1000
        });
        var fileId = undefined;
        var metaData = {};
        progress.on('progress', progress => {
            var per = Math.round(progress.percentage);
            progress.percentage = per;
            progress.transferred = prettysize(progress.transferred);
            progress.remaining = prettysize(progress.remaining);
            progress.speed = prettysize(progress.speed) + "ps";
            if (progress.eta)
                progress.eta = prettyTime(progress.eta * 1000000000);
            current_client.emit('upload', {progress, fileId});
        });
        //First we visit the url
        request.get(req.query.url)
            .on('error', err => {
                console.log(err)
                return res.json(req.error("Invalid urls"));
            })
            .on('response', response => {
                //On Response we create headers and upload the file
                options.headers = response.headers;
                options.headers["Authorization"] = "Bearer " + req.cookies.access_token.access_token;
                if (response.statusCode == 200) {
                    var metaData = response.headers;
                    metaData.name = path.basename(req.query.url);
                    metaData.size = prettysize(response.headers['content-length'], true, true);
                    metaData.hash = crypto.createHmac('sha256', 'samundrakc').update(response.headers.name + Date.now()).digest('hex');
                    fileId = response.headers.hash;
                    res.json(req.success(metaData));
                    progress.setLength(response.headers['content-length']);
                }
                else {
                    return res.json(req.error("This Url doesn't provide direct download"));
                }
                options.headers = _.omit(options.headers, 'hash', 'name', 'size');
                console.log(options)
            })
            .pipe(function () {
                return function () {
                }
            })
            .pipe(progress)
            .pipe(request.post(options, (err, status, result)=> {
                // console.log(err,status,result)
                console.log(options)
                console.log(result)
                if (err) {
                    if (req.query.email) {
                        email.setSubject("Error uploading file");
                        email.setMessage("File you requested to upload to google drive of " + req.query.url + " has been failed, You can try to upload file again");
                        email.init();
                        email.send();
                    }
                    console.log(err);
                    return;
                }

                result = JSON.parse(result);
                if (result.hasOwnProperty('error')) {
                    console.log(result.message);
                    if (req.query.email) {
                        email.setSubject("Error uploading file");
                        email.setMessage("File you requested to upload to google drive of " + req.query.url + " has been failed, You can try to upload file again. Error message is " + result.error.message);
                        email.init();
                        email.send();
                    }
                    return;
                }
                //After file has been upload we rename it
                var updation = {
                    url: 'https://www.googleapis.com/drive/v3/files/' + result.id,
                    method: 'PATCH',
                    headers: {
                        "Authorization": options.headers['Authorization'],
                        'Content-Type': 'application/json'
                    },
                    json: {
                        fileId: result.id,
                        name: path.basename(req.query.url),
                        mimeType: options.headers['content-type'],
                    }
                }
                request(updation, (err, result) => {
                    if (err) {
                        console.log(err);
                        if (req.query.email) {
                            email.setSubject("Error uploading file");
                            email.setMessage("File you requested to upload to google drive of " + req.query.url + " has been failed, You can try to upload file again.");
                            email.init();
                            email.send();
                        }
                        return;
                    }


                    if (result.hasOwnProperty('error')) {
                        console.log(result.error)
                        if (req.query.email) {
                            email.setSubject("Error uploading file");
                            email.setMessage("File you requested to upload to google drive of " + req.query.url + " has been failed, You can try to upload file again. Error message is " + result.error.message);
                            email.init();
                            email.send();
                        }
                        return;
                    }

                    if (req.query.email) {
                        email.setSubject("File Uploaded");
                        email.setMessage("File you requested to upload to google drive of " + req.query.url + " has been uploaded succesfully");
                        email.init();
                        email.send();
                    }
                });
            }));
    }
}