// EXTRA FUNCTION: ASSIGNED TO - CREATE

function assignedTo(event) {

  // Data Calling

  var userProperties = PropertiesService.getUserProperties();

  var listIdentifier = event.formInput.Lists

  userProperties.setProperty("TASK_DESCRIPTION", event.formInput.text_input_form_input_key);
  userProperties.setProperty("TASK_DATE", event.formInput.date_picker_value);
  userProperties.setProperty("TASK_LIST", event.formInput.Lists);
  userProperties.setProperty("TASK_STATUS", event.formInput.status);
  userProperties.setProperty("TASK_PRIORITY", event.formInput.checkbox_field);
  
  // API - Mark Task as Done
 
  var response = this.accessProtectedResource('---------------------------------'+listIdentifier+'?status=ALL', 'get', 'application/json', null, null)

  Logger.log(response);

  var dropdownList = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.DROPDOWN)
    .setTitle("")
    .setFieldName("assigned_to")

  var json = response.getContentText();
  var data = JSON.parse(json);
  for(i in data){
    dropdownList.addItem(data[i]['firstName'] + ' ' + data[i]['lastName'], data[i]['userIdentifier'], false)
  }

  // Create Card

  var cardHeaderSet = CardService.newCardHeader()
    .setTitle("Assign to User")
    .setImageUrl('https://img.icons8.com/pastel-glyph/2x/person-male--v3.png');

  var homeButtonAction = CardService.newAction()
    .setFunctionName('createDockCard')
  
  var homeButton = CardService.newTextButton()
      .setText('Return Home')
      .setOnClickAction(homeButtonAction)
  
  var homeButtonSet = CardService.newButtonSet()
      .addButton(homeButton)
  
  var searchButtonAction = CardService.newAction()
    .setFunctionName('addTask')
  
  var searchButton = CardService.newTextButton()
      .setText('Return to Task')
      .setOnClickAction(searchButtonAction)
  
  var searchButtonSet = CardService.newButtonSet()
      .addButton(searchButton)

  var dropSection = CardService.newCardSection()
      .addWidget(dropdownList)

  var buttonSection = CardService.newCardSection()
      .addWidget(searchButtonSet)
      //.addWidget(homeButtonSet)
  
  var showListCard = CardService.newCardBuilder()
      .setHeader(cardHeaderSet)
      .addSection(dropSection)
      .addSection(buttonSection)
  
  return showListCard.build();

}

// EXTRA FUNCTION: ASSIGNED TO - EDIT

function editAssignedTo(event) {

  // Data Calling

  var userProperties = PropertiesService.getUserProperties();

  var listIdentifier = event.formInput.Lists

  userProperties.setProperty("TASK_DESCRIPTION", event.formInput.text_input_form_input_key);
  userProperties.setProperty("TASK_DATE", event.formInput.date_picker_value);
  userProperties.setProperty("TASK_LIST", event.formInput.Lists);
  userProperties.setProperty("TASK_STATUS", event.formInput.status);
  userProperties.setProperty("TASK_PRIORITY", event.formInput.checkbox_field);
  
  // API - Mark Task as Done
 
  var response = this.accessProtectedResource('----------------------------------'+listIdentifier+'?status=ALL', 'get', 'application/json', null, null)

  Logger.log(response);

  var dropdownList = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.DROPDOWN)
    .setTitle("")
    .setFieldName("assigned_to")

  var json = response.getContentText();
  var data = JSON.parse(json);
  for(i in data){
    dropdownList.addItem(data[i]['firstName'] + ' ' + data[i]['lastName'], data[i]['userIdentifier'], false)
  }

  // Create Card

  var cardHeaderSet = CardService.newCardHeader()
    .setTitle("Assign to User")
    .setImageUrl('https://img.icons8.com/pastel-glyph/2x/person-male--v3.png');

  var homeButtonAction = CardService.newAction()
    .setFunctionName('createDockCard')
  
  var homeButton = CardService.newTextButton()
      .setText('Return Home')
      .setOnClickAction(homeButtonAction)
  
  var homeButtonSet = CardService.newButtonSet()
      .addButton(homeButton)
  
  var searchButtonAction = CardService.newAction()
    .setFunctionName('editTask')
  
  var searchButton = CardService.newTextButton()
      .setText('Return to Task')
      .setOnClickAction(searchButtonAction)
  
  var searchButtonSet = CardService.newButtonSet()
      .addButton(searchButton)

  var dropSection = CardService.newCardSection()
      .addWidget(dropdownList)

  var buttonSection = CardService.newCardSection()
      .addWidget(searchButtonSet)
      //.addWidget(homeButtonSet)
  
  var showListCard = CardService.newCardBuilder()
      .setHeader(cardHeaderSet)
      .addSection(dropSection)
      .addSection(buttonSection)
  
  return showListCard.build();

}
