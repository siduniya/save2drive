var fs = require('fs');
var request = require('request');
var _ = require('underscore');
var path = require('path');
module.exports = {
    lists: (req, res, next) => {
        req.service.files.list({
            // pageSize :10,
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
    upload: (req, res, next)=> {
        if (!req.query.url) {
            return res.json(req.error("No any url found"));
        }

        var options = {
            url: ' https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
            headers: {},
        }
        //First we visit the url
        request.get(req.query.url)
            .on('error', err=> {
                console.log(err);
                return res.json(req.error("Invalid url"));
            })
            .on('response', response=> {
                //On Response we create headers and upload the file
                options.headers = response.headers;
                options.headers["Authorization"] = "Bearer " + req.cookies.access_token.access_token;
                options.form = {name: 'samundra.txt'};
                if (response.statusCode == 200)
                    res.json(req.success(response.headers));
                else
                    res.json(req.error("There was Problem Connecting to api"));
            })
            .pipe(request.post(options, (err, status, result)=> {
                if (err) {
                    console.log(err);
                    return;
                }

                result = JSON.parse(result);
                if(result.hasOwnProperty('error')){
                    console.log(result.error.message);
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
                request(updation, err=> {
                    if (err) {
                        console.log(err);
                        return;
                    }
                });
            }));
    }
}