const AwsConfig = require('../helpers/AwsConfig');

let signUp = function (email, password) {

    return new Promise((resolve) => {
        AwsConfig.initAWS();
        AwsConfig.setCognitoAttributeList(email);

        AwsConfig.getUserPool().signUp(email, password, AwsConfig.getCognitoAttributeList(), null, function(err, result) {
            if (err) {
                return resolve({ statusCode: 422, response: err });
            }
            let response = {
                username: result.user.username,
                userConfirmed: result.userConfirmed,
                userAgent: result.user.client.userAgent,
            }
            return resolve({ statusCode: 201, response: response });
        });
    });
}

let verify = function (email, code) {
    return new Promise((resolve) => {
        AwsConfig.getCognitoUser(email).confirmRegistration(code, true, (err, result) => {
            if (err) {
                return resolve({ statusCode: 422, response: err });
            }
            return resolve({ statusCode: 200, response: result });
        });
    });
}

let signIn = function (email, password) {
    return new Promise((resolve) => {

        AwsConfig.getCognitoUser(email).authenticateUser(AwsConfig.getAuthDetails(email, password), {
            onSuccess: (result) => {
                const token = {
                    accessToken: result.getAccessToken().getJwtToken(),
                    idToken: result.getIdToken().getJwtToken(),
                    refreshToken: result.getRefreshToken().getToken(),
                }
                return resolve({ statusCode: 200, response: AwsConfig.decodeJWTToken(token) });
            },

            onFailure: (err) => {
                return resolve({ statusCode: 400, response: err.message || JSON.stringify(err)});
            },
        });
    });
}

module.exports = {
    signUp,
    verify,
    signIn
}