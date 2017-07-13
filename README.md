# bms-push-email-sample
Demonstrate extending Bluemix Push Notifications to Email
## Prerequisites
* SendGrid Account ( https://sendgrid.com/)
* Bluemix account (https://console.bluemix.net)

## Setup for SendGrid
Follow the instructions in SendGrid to create an account and obtain API Key.

## Setup for bluemix
Create or login to your bluemix account and create an instance of push with the name "bms-push-notifications" in your space

## Setup for the sample
* Download this code from git and edit the manifest file.
* Add your SendGrid API Key in "SENDGRID_API_KEY" variable. Also set a FROM_EMAIL address to be used while sending the email.
* Login to Bluemix using command line (either bx or cf tool) and target your space in bluemix
* Do a "cf push" in the sample's root folder

## Configure Push Service with the sample
* Open the Push Notification service instance or use the REST API of Push and add the HTTP configuration to point to the bluemix app you uploaded in the previous step. For example the end point will be "http://bms-push-email-sample.bluemix.net"
* Also create a tag in Push names "CarLoan".
* Now open the sample UI of the node application and input the emailId and a unique name for the emailId and hit "Register" button
* Now send the message using the Push Notification service dashboard or the Push Notification Service REST API targetting the device, platform or tag name.
* You will see an email at your inbox.

