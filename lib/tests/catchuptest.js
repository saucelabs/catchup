var caps = require('./capabilities.json');
var inquirer = require("inquirer");
var open = require('open');
var chalk = require('chalk');
var highlight = require('ansi-highlight');
var path = require('path');

module.exports = function (userInput) {
  var self = this;
  
  // we should get the extra params here to know what actions the user
  // wanted to run against the sample website
  var actions = self.userInput.sampleTest.actions;

  var webdriver = require('selenium-webdriver'),
  By = require('selenium-webdriver').By,
  username = this.userInput.username,
  accessKey = this.userInput.accessKey,
  driver;

  var filePath = path.join(__dirname, 'capabilities.json');
  var capsCode = require('fs').readFileSync(filePath, 'utf8');

  console.log(chalk.blue('Capabilities used with this test: \n'));
  console.log(highlight(capsCode),'\n');

  var capabilities = {
    'username': username,
    'accessKey': accessKey
  };
  for (var c in caps) {
    if (caps.hasOwnProperty(c)) {
      capabilities[c] = caps[c];
    }
  }

  driver = new webdriver.Builder().
    withCapabilities(capabilities).
    usingServer("http://" + username + ":" + accessKey +
              "@ondemand.saucelabs.com:80/wd/hub").
                build();
 
  // get the session id to link to test later  
  var sessionId;
  driver.session_.then(function(sessionData) {
      sessionId = sessionData.caps_.caps_['webdriver.remote.sessionid'];
  });

  driver.get('http://saucelabs.github.io/catchup/');

  // if the first option was selected, we get page title
  if(actions.indexOf('title') > -1){
    driver.getTitle().then(function (title) {
      console.log("title is: " + title);
    });
  }

  // if the second option was selected, we get the email field
  if(actions.indexOf('emailInput') > -1){
    el = driver.findElement(By.id('email'));
  }
  
  if(actions.indexOf('emailValue') > -1){
    driver.findElement(By.id('email')).sendKeys('catchup@saucy.com');
  }

  if(actions.indexOf('passValue') > -1){
    driver.findElement(By.id('password')).sendKeys('saucypassword');
  }

  if(actions.indexOf('button') > -1){
    el = driver.findElement(By.tagName('button'));
  }

  if(actions.indexOf('click') > -1){
    driver.findElement(By.tagName('button')).click();
  }

  driver.quit().then(function(){
    
    var statement = [
        {
          type: "input",
          name: "statement",
          message: "Done! Press enter to see the results"
        }
      ];

      inquirer.prompt(statement, function (results) {
        // launch test results
        open("https://saucelabs.com/beta/tests/" + sessionId);
        console.log('Flow complete');
      });

  });

}
