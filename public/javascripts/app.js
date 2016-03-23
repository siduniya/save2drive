
var io =  io.connect(window.location.href);
Vue.config.debug = true;
Vue.config.silent = false;

io.on('takeYourToken',function(data){
    if(typeof data === 'object' && data.hasOwnProperty('token')){
            document.cookie = "id=" + data.token;
    }
});


var fileList = new Vue({
    el: "#files",
    data: {
        test: 'samundra',
        files: [],
        file_url: undefined,
        message: '',
        loading: true,
        fileDetails: [],
    },
    methods: {
        submitUrlForUpload(){
            if(this.loading) {
                return;
            }
            this.loading =true;
            if (this.file_url.trim().length < 3) return;
            this.$http.get('/api/upload?url=' + this.file_url)
                .then(response => {
                    if (response.data.success) {
                        response.data.data.url =  this.file_url;
                        response.data.data.type = response.data.data['content-type'];
                        var data = response.data.data;
                        data.progress = {
                            at : 0,
                            uploaded :0,
                            remains :0,
                            eta :0,
                            speed:0
                        }
                        this.fileDetails.push(data);
                        this.$set('message', '');
                        this.$set('file_url', '');
                    } else {
                        this.$set('message', response.data.data);
                    }
                    this.loading  = false;
                });
        }
    },
    created(){
        this.$http.get('/api/lists',{})
            .then(response =>{
                this.$set('loading',false);
                console.log(response.data)
                if(response.data.success){
                    this.$set('files',response.data.data);
                }
                else{
                    if(typeof response.data != 'object'){
                        this.$set('message',response.data);
                    }
                    else{
                        this.$set('message',response.data.data);
                    }
                }
            });
    },
});

io.on('upload',function(data){
    var item = _.findWhere(fileList.fileDetails,{hash:data.fileId});
    item.progress.at = data.progress.percentage;
    item.progress.uploaded = data.progress.transferred;
    item.progress.remains = data.progress.remaining;
    item.progress.eta = data.progress.eta || 'Completed';
    item.progress.speed = data.progress.speed;
    // $("#"+data.fileId).css("width",data.progress.percentage+"%");
});
