Vue.config.debug = true;
Vue.config.silent = false;


var fileList = new Vue({
    el : "#files",
    data :{
        test : 'samundra',
        files : [],
        file_url:undefined
    },
    methods:  {
        submitUrlForUpload(){
            console.log(this.file_url);
        }
    },
    created(){
        this.$http.get('/api/lists',{})
            .then(response =>{
                if(response.data.success)
                this.$set('files',response.data.data);
            });
    },
});