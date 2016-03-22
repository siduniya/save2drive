var fs =  require('fs');
var request = require('request');
module.exports = {
    lists: (req, res, next) => {
        req.service.files.list({
            pageSize :10,
            // fields: " files(id, name,corpus)"
        },(err,response)=>{
                if(err){
                    console.log(err);
                    return res.json(req.error("Error while fetching lists from drive"));
                }
            return res.json(req.success(response.files));
        });

    },
    upload : (req,res,next)=>{
        if(!req.query.url){
            return res.json(req.error("No any url found"));
        }

        var options = {
            // form : {
            //     title : 'samundra'
            // },
            url :' https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
            headers : {

            },
        }
        request.get(req.query.url)
            .on('error',err=>{
                console.log(err);
                return res.json(req.error("Invalid url"));
            })
            .on('response',response=>{
               options.headers = response.headers;
                console.log(req.cookies.access_token)
                options.headers["Authorization"]= "Bearer " +  req.cookies.access_token.access_token;
               if(response.statusCode == 200)
                res.json(req.success(response.headers));
                else
                   res.json(req.error("There was Problem Connecting to api"));
            })
            .pipe(request.post(options,(err,status,result)=>{
                    if(err){
                        console.log(err);
                        return;
                    }
                console.log(result);
                // req.socket.
            }));
    }
}