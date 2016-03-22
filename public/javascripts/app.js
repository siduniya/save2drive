var io =  io.connect('http://localhost:3000');
Vue.config.debug = true;
Vue.config.silent = false;

io.on('upload',function(data){
    console.log(data);
});
var fileList = new Vue({
    el : "#files",
    data :{
        test : 'samundra',
        files : [],
        file_url:undefined,
        message : '',
        loading :  true,
    },
    methods:  {
        submitUrlForUpload(){
            if(this.file_url.trim().length < 3) return;
            this.$http.get('/api/upload?url='+this.file_url)
                .then(response =>{
                    console.log(response.data);
                    // this.$set('message','');
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