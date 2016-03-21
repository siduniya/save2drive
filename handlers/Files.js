module.exports = {
    lists: (req, res, next) => {
        var service  =  req.google.drive('v3');
        service.files.list({
            auth: req.oauth,
            pageSize :10,
            fields: "nextPageToken, files(id, name)"
        },(err,response)=>{
                if(err){
                    console.log(err);
                    return res.json(req.error("Error"));
                }
            console.log(response);
            return res.json(req.success(response.files));
        });
    }
}