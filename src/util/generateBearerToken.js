const OAuth = require("oauth");
const { promisify } = require('util');
const generateBearerToken = async () => {

    let oauth2 = OAuth.OAuth2;
    oauth2 = new oauth2(
        process.env.API_KEY,
        process.env.API_SECRET_KEY,
        'https://api.twitter.com/', 
        null, 
        'oauth2/token', 
        null
    );
        
    const getOAuthAccessToken = promisify(oauth2.getOAuthAccessToken.bind(oauth2));
    const accessToken = await getOAuthAccessToken('', { grant_type: 'client_credentials' });
    return "Bearer " + accessToken;
};

module.exports = generateBearerToken;
