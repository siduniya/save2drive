var google = require('googleapis');
var googleAuth = require('google-auth-library');

function Drive() {
}
Drive.prototype.init =  ()=> {
    this.credits = {
        client_id: '967750942304-1mt9td3em986fk2nsau9ca9ph5lu41rp.apps.googleusercontent.com',
        client_secret: 'Ex461MkAWOomqhvL2njqYFTX',
        redirect: 'http://localhost:3000/token'
    };
    this.SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly', 'https://www.googleapis.com/auth/drive.metadata.readonly', 'https://www.googleapis.com/auth/drive.metadata.readonly', 'https://www.googleapis.com/auth/drive.metadata.readonly', 'https://www.googleapis.com/auth/drive.metadata.readonly']

}
Drive.prototype.connect =  ()=> {
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2(this.credits.client_id, this.credits.client_secret, this.credits.redirect);
    return oauth2Client;
}
Drive.prototype.getAuthUrl = oauth2Client =>{
    var authUrl = oauth2Client.generateAuthUrl(
        {
            access_type: 'offline',
            scope: this.SCOPES
        }
    );
        return  authUrl;
}

Drive.prototype.files =  ()=>{
    
}
module.exports = Drive;