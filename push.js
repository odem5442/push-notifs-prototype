var AWS = require('aws-sdk');
//var argv = require('yargs').argv;
var argv = require('yargs')
    .usage('Usage: node $0 [options]')
    .option('registerDevice', { describe: 'Create Platform Application Endpoint Arn', type: 'boolean'})
    .option('createTopic', { describe: 'Create a topic in SNS', type: 'boolean'})
    .option('publish', { describe: 'Publish a message either to a topic or an individual device', type: 'boolean'})
    .option('token', { describe: 'Unique identifier created by the notification service for an app on a device', type: 'string'})
    .option('platform', { describe: 'platform of the device to register', type: 'string' })
    .option('endpointArn', { describe: 'endpointArn of the device that is registered with SNS', type: 'string' })
    .example('node $0 --registerDevie --platform iOS --token de6881bc6729bd...', 'Register an iOS device with token de6881bc6729bd...')
    .example('node $0 --publish --endpointArn arn:aws:sns:us-west-1:342...', 'Publish a message to an endpointArn')
    .example('node $0 --createTopic --topicName balance-deposit', 'Create a SNS Topic with name balance-deposit')
    .help('h')
    .alias('h', 'help')
    .argv;

AWS.config.update({
  accessKeyId: 'AKIAJCDMQA7J32Vxxxxx',
  secretAccessKey: 'x7OzmAQy2+Bg/NeDB5fhHA4tXcTxxxxxxxxxx',
  region: 'us-west-1'
});

// Platform Application ARNs for iOS and Android
const PlatformApplicationArnIos = "arn:aws:sns:us-west-1:342535183874:app/APNS_SANDBOX/spxxxxx";
const PlatformApplicationArnAndroid = "arn:aws:sns:us-west-1:342535183874:app/GCM/spip-androidxxxxx";

var sns = new AWS.SNS();

if ( argv.createTopic ) {
    sns.createTopic({
        Name: argv.topicName
      }, function(err, data) {
        if (err) {
            console.log("Error while creating topic: " + err);
            return;
        } else {
            console.log(data);
            topicArn = data.TopicArn;
            console.log("Topic created: " + topicArn);
        }
    });
}

// Publish a message
if (argv.publish) {
    if ( !argv.topicName && !argv.topicArn && !argv.endpointArn) {
        console.error("One of the following parameters are required to send message: topicName, topicArn or endpointArn");
        process.exit(1);
    }
  
  //get topicArn from topicName

  // Publish a message
  var params = {
      Message: "Hello from Sparkpay!",
      TargetArn: argv.endpointArn
      //TopicArn: argv.topicArn, 
      //MessageStructure: 'json'
      // MessageAttributes: {
      //     'foobar' : {
      //         DataType: 'String',
      //         StringValue: 'Hello'
      //     }
      // }
  };

  sns.publish(params, function(err, data) {
      if (err) { 
          console.log("an error occured while publishing: " + err);
      } else {
          console.log("Successfully published message");
      }
  });
}

if (argv.registerDevice) {
    if ( !argv.platform && !argv.token ) {
        console.log("platform(iOS/android) and deviceToken/registrationId are mandatory to register a device");
        process.exit(1);
    }
    
    if (argv.platform === 'iOS') {
        sns.createPlatformEndpoint({
            PlatformApplicationArn: PlatformApplicationArnIos,
            Token: argv.token
        }, function(err, data) {
            if (err) {
                console.log("error while registering device: " + err);
            }
            else { 
                console.log("successfully registered device ");
            }

        }
        
        );
    } else if ( argv.platform === 'android' ) {
        sns.createPlatformEndpoint({
            PlatformApplicationArn: PlatformApplicationArnAndroid,
            Token: argv.token
        }, function(err, data) {
            if (err) {
                console.log("error while registering device: " + err);
            }
            else { 
                console.log("successfully registered registrationId: " + argv.registrationId);
            }
        }
        );
    }
}


if (argv.listTopics) {
    sns.listTopics({ NextToken: null}, function(err, data) {
        if (err) { 
            console.log("error while retrieving all topics: " + err);
        } else {
            console.log("Sucessfully retrieved all topics: " + data);
        }
    });
}








