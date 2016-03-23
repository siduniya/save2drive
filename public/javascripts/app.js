// var io =  io.connect('http://localhost:3000');
Vue.config.debug = true;
Vue.config.silent = false;

// io.on('upload',function(data){
//     console.log(data);
// });
var fileList = new Vue({
    el: "#files",
    data: {
        test: 'samundra',
        files: [],
        file_url: undefined,
        message: '',
        loading: true,
        fileDetails: []
    },
    methods: {
        submitUrlForUpload(){
            if (this.file_url.trim().length < 3) return;
            this.$http.get('/api/upload?url=' + this.file_url)
                .then(response => {
                    if (response.data.success) {
                        response.data.data.url =  this.file_url;
                        response.data.data.type = response.data.data['content-type'];
                        this.fileDetails.push(response.data.data);
                        this.$set('message', '');
                        this.$set('file_url', '');
                    } else {
                        this.$set('message', response.data.data);
                    }
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