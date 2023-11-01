DOCKHEALTHURL = "-----------------"

// Starting up the add - on

function onHomepage(event) {
  Logger.log(event);
  console.log('onHomepage')
  // var message = createWelcomeMessage(event);
  // return createDockCard(message, true);    
  return createDockCard(null, true);
}

function onGmailMessage(event) {
  Logger.log(event);
  // var message = createWelcomeMessage(event);
  // return createDockCardEmail(message, true); 
  return createDockCardEmail(null, true);
}

// EXTRA FUNCTION: TIME

function handleDateTimeChange(event) {
  var dateTimeInput =
    event.commonEventObject.formInputs["myDateTimePickerWidgetID"];
  var msSinceEpoch = dateTimeInput.msSinceEpoch;
  var hasDate = dateTimeInput.hasDate;
  var hasTime = dateTimeInput.hadTime;

  var userTimezoneId = event.userTimezone.id;

  var formattedDateTime;
  if (hasDate && hasTime) {
    formattedDateTime = Utilities.formatDate(
      new Date(msSinceEpoch), userTimezoneId, "yyy/MM/dd hh:mm:ss");
  } else if (hasDate) {
    formattedDateTime = Utilities.formatDate(
      new Date(msSinceEpoch), userTimezoneId, "yyy/MM/dd")
      + ", Time unspecified";
  } else if (hasTime) {
    formattedDateTime = "Date unspecified, "
      + Utilities.formatDate(
          new Date(msSinceEpoch), userTimezoneId, "hh:mm a");
  }

  if (formattedDateTime) {
    console.log(formattedDateTime);
  }
}

// EXTRA FUNCTION: SETTINGS CARD

function settingsCard(event) {
  
  //Help Button
  
  var helpButtonAction = CardService.newAction()
    .setFunctionName('help')
  
  var helpButton = CardService.newTextButton()
      .setText('Get Help')
      .setOnClickAction(helpButtonAction)
  
  var helpButtonSet = CardService.newButtonSet()
      .addButton(helpButton)
  
  //feedback button
  
  var feedbackButtonAction = CardService.newAction()
    .setFunctionName('feedback')
  
  var feedbackButton = CardService.newTextButton()
      .setText('Give Feedback')
      .setOnClickAction(feedbackButtonAction)
  
  var feedbackButtonSet = CardService.newButtonSet()
      .addButton(feedbackButton)
  
  //Logout button
  
  var logoutButtonAction = CardService.newAction()
    .setFunctionName('logout')
  
  var logoutButton = CardService.newTextButton()
      .setText('Logout')
      .setOnClickAction(logoutButtonAction)
  
  var logoutButtonSet = CardService.newButtonSet()
      .addButton(logoutButton)
  
  //Sections Init
  
  var buttonSection = CardService.newCardSection()
      .addWidget(helpButtonSet)
      .addWidget(feedbackButtonSet)
      .addWidget(logoutButtonSet);
 
  
  //Card Init
  
  var settingCard = CardService.newCardBuilder()
      //.addSection(menuSection)
      .addSection(buttonSection);
  
  
  return settingCard.build();
}


function getOAuthService() {
  return OAuth2.createService('"-----------------"')
      .setAuthorizationBaseUrl('"-----------------"')
      .setTokenUrl('"-----------------"')
      .setClientId('"-----------------"')
      .setClientSecret('"-----------------"')
      // .setScope('SERVICE_SCOPE_REQUESTS')
      .setCallbackFunction('authCallback')
      .setCache(CacheService.getUserCache())
      .setPropertyStore(PropertiesService.getUserProperties());
}


function authCallback(callbackRequest) {
  var authorized = getOAuthService().handleCallback(callbackRequest);
  if (authorized) {
    return HtmlService.createHtmlOutput(
      'Success! <script>setTimeout(function() { top.window.close() }, 1);</script>');
  } else {
    return HtmlService.createHtmlOutput('Denied');
  }
}

function resetOAuth() {
  getOAuthService().reset();
}

function create3PAuthorizationUi() {
  var service = getOAuthService();
  var authUrl = service.getAuthorizationUrl();
  var authButton = CardService.newTextButton()
      .setText('Begin Authorization')
      .setAuthorizationAction(CardService.newAuthorizationAction()
          .setAuthorizationUrl(authUrl));

  var promptText =
      'To show you information from your 3P account that is relevant' +
      ' to the recipients of the email, this add-on needs authorization' +
      ' to: <ul><li>Read recipients of the email</li>' +
      '         <li>Read contact information from 3P account</li></ul>.';

  var card = CardService.newCardBuilder()
      .setHeader(CardService.newCardHeader()
          .setTitle('Authorization Required'))
      .addSection(CardService.newCardSection()
          .setHeader('This add-on needs access to your 3P account.')
          .addWidget(CardService.newTextParagraph()
              .setText(promptText))
          .addWidget(CardService.newButtonSet()
              .addButton(authButton)))
      .build();
  return [card];
}

/**
 * When connecting to the non-Google service, pass the name of the
 * custom UI callback function to the AuthorizationException object
 */
function accessProtectedResource(url, method_opt, content_type_opt, payload, headers_opt) {
  var service = getOAuthService();
  if (service.hasAccess()) {
    Logger.log("service has access")
    // Make the UrlFetch request and return the result.
    
    var response = UrlFetchApp.fetch(url, {
        'muteHttpExceptions': false, 
        'method' : method_opt,
        'contentType': content_type_opt,
        'payload' : payload,
        'headers': {
          "Authorization": "Bearer " + service.getAccessToken()
        }
      }
    );
    Logger.log(response);
    return response;

  } else {
    Logger.log("service has no access")
    // Invoke the authorization flow using a custom authorization
    // prompt card.
    CardService.newAuthorizationException()
        .setAuthorizationUrl(service.getAuthorizationUrl())
        .setResourceDisplayName("Display name to show to the user")
        .setCustomUiCallback('create3PAuthorizationUi')
        .throwException();
  }
}
