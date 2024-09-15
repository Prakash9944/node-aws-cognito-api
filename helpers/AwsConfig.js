const AWS = require('aws-sdk');
const jwt_decode = require('jwt-decode');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const cognitoAttributeList = [];
const poolData = {
    UserPoolId : process.env.AWS_COGNITO_USER_POOL_ID,
    ClientId : process.env.AWS_COGNITO_CLIENT_ID
};

let setCognitoAttributeList = function(email) {
    let attribute = {
        Name : 'email',
        Value : email
    }
    cognitoAttributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute(attribute))
}

let getCognitoAttributeList = function() {
    return cognitoAttributeList;
}

let getUserPool = function() {
    return new AmazonCognitoIdentity.CognitoUserPool(poolData);
}

let getCognitoUser = function(email) {
    let userData = {
        Username: email,
        Pool: getUserPool()
    };

    return new AmazonCognitoIdentity.CognitoUser(userData);
}

let getAuthDetails = function (email, password) {
    let authenticationData = {
        Username: email,
        Password: password,
    };

    return new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
}

let initAWS = function (region = process.env.AWS_REGION, identityPoolId = process.env.AWS_COGNITO_IDENTITY_POOL_ID) {
    AWS.config.region = region;
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: identityPoolId,
    });
}

let decodeJWTToken = function (token) {
    let { email, exp, auth_time , token_use, sub} = jwt_decode(token.idToken);

    return {
        token, email,
        exp, uid: sub,
        auth_time, token_use
    };
}

module.exports = {
    initAWS,
    getCognitoAttributeList,
    getUserPool,
    getCognitoUser,
    setCognitoAttributeList,
    getAuthDetails,
    decodeJWTToken,
}
