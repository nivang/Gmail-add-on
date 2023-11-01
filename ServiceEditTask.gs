// Case 3: EDIT TASK

function editTask(event) {
  
  Logger.log(event);

// Header Definition
  
  var userProperties = PropertiesService.getUserProperties();
  var profileImageUrl = userProperties.getProperty("DOCK_USER_PROFILE_IMAGE_URL");
  var userFullName = userProperties.getProperty("DOCK_USER_FULL_NAME");
  var userIdentifier = userProperties.getProperty("DOCK_USER_IDENTIFIER");

  var editTaskIdentifier = userProperties.getProperty("EDIT_TASKIDENTIFIER");

  // Get Task Data - API

  var response = this.accessProtectedResource('-------------------------------------'+editTaskIdentifier, 'get', 'application/json', null, null)

  var json = response.getContentText();
  var edit_data = JSON.parse(json);

  console.log(edit_data)

  // Header

  var cardHeaderSet = CardService.newCardHeader()
    .setTitle("Edit Task")
    .setImageUrl('http://simpleicon.com/wp-content/uploads/pencil-256x256.png');

// Widget Definition

  var task_description = userProperties.getProperty("TASK_DESCRIPTION");

  console.log(task_description)

  if (task_description == null || task_description == 'undefined') {

    var taskDescriptionInput = CardService.newTextInput()
    .setFieldName("text_input_form_input_key")
    .setTitle("Description")
    .setValue(edit_data['description'])

  } else {

    var taskDescriptionInput = CardService.newTextInput()
    .setFieldName("text_input_form_input_key")
    .setTitle("Description")
    .setValue(task_description)

  }

  // Assigned to - Edit

  var action = CardService.newAction().setFunctionName('editAssignedTo');

  console.log(event.formInput.assigned_to)

  if (event.formInput.assigned_to == null) {

    for(i in edit_data['assignedToUsers']){
      var assigned_to_idenifier = edit_data['assignedToUsers'][i]['userIdentifier']
      console.log(edit_data['assignedToUsers'][i]['userIdentifier'])
    }
    
  } else {
    var assigned_to_idenifier = event.formInput.assigned_to;
  }

  Logger.log(response);

  console.log(assigned_to_idenifier)

  userProperties.setProperty("DOCK_ASSIGNED_TO_IDENTIFIER", assigned_to_idenifier);

  var response = this.accessProtectedResource('----------------------------------------'+assigned_to_idenifier, 'get', 'application/json', null, null)

  var json = response.getContentText();
  var assignedToData = JSON.parse(json);

  console.log(assignedToData)

  var name = assignedToData['userName']

  // console.log(edit_data['assignedToUsers'])

  console.log(name)

  var assignedToInput = CardService.newDecoratedText()
    .setText(name)
    .setTopLabel("Assigned To")
    .setOnClickAction(action);

  var dateOnlyPicker = CardService.newDatePicker()
    .setTitle("Due Date")
    .setFieldName("date_picker_value")
    //.setValueInMsSinceEpoch(taskDate)
               
  var submitButtonAction = CardService.newAction()
    .setFunctionName('editSubmit')
  
  var submitButton = CardService.newTextButton()
      .setText('Post Changes')
      .setOnClickAction(submitButtonAction)
  
  var submitButtonSet = CardService.newButtonSet()
      .addButton(submitButton)

  // Add Task: Status

  var taskStatus = edit_data['workflowStatus']['identifier'];

  var response = this.accessProtectedResource('-------------------------------', 'get', 'application/json', null, null)

  var status = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.RADIO_BUTTON)
    .setFieldName("status")

  var json = response.getContentText();
  var data = JSON.parse(json);
  var taskStatus2 = userProperties.getProperty("TASK_STATUS");


  for (i in data) {

    if (taskStatus == data[i]['identifier']) {

      status.addItem(data[i]['name'], data[i]['identifier'], true)

    } else {

     status.addItem(data[i]['name'], data[i]['identifier'], false)

   }
  }

  

  var taskPriority = edit_data['priority']

  if (taskPriority == "HIGH") {

    var priority = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.CHECK_BOX)
    //.setTitle("A group of checkboxes. Multiple selections are allowed.")
    .setFieldName("checkbox_field")
    .addItem("High Priority", "HIGH", true)
  
  } else {

    var priority = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.CHECK_BOX)
    //.setTitle("A group of checkboxes. Multiple selections are allowed.")
    .setFieldName("checkbox_field")
    .addItem("High Priority", "HIGH", false)

  }

  
  // Add Task: Lists

    var task_list = edit_data['taskList']['taskListIdentifier'];

  var response = this.accessProtectedResource('------------------------------------', 'get', 'application/json', null, null)

  Logger.log(response);
  
  var dropdownList = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.DROPDOWN)
    .setTitle("")
    .setFieldName("Lists")

  var json = response.getContentText();
  var data = JSON.parse(json);
  for(i in data){

    if (data[i]['taskListIdentifier'] == task_list) {

      dropdownList.addItem(data[i]['listName'], data[i]['taskListIdentifier'], true)

    } else {

      dropdownList.addItem(data[i]['listName'], data[i]['taskListIdentifier'], false)

    }
  }

  // Text

  var taskDetailsText = CardService.newTextParagraph()
    .setText('<font color="#EC4F3E"><b>Task Details</b></font>');

  var taskAdditionalDetailsText = CardService.newTextParagraph()
    .setText('<br><font color="#EC4F3E"><b>Task Type</b></font>');

  // Section Definition

  var listSection = CardService.newCardSection()
    .addWidget(dropdownList)

  var addTaskSection = CardService.newCardSection()
      .addWidget(taskDetailsText)
      .addWidget(taskDescriptionInput)
      .addWidget(dateOnlyPicker)
      .addWidget(assignedToInput)
      .addWidget(taskAdditionalDetailsText)
      .addWidget(status)
      .addWidget(priority);
  
  var taskTypeSection = CardService.newCardSection()
      .addWidget(taskAdditionalDetailsText)
      .addWidget(status)
      .addWidget(priority)

  var buttonSection = CardService.newCardSection()
    .addWidget(submitButtonSet);

  // Card Definition
  
  var addTaskCard = CardService.newCardBuilder()
      .setHeader(cardHeaderSet)
      .addSection(listSection)
      .addSection(addTaskSection)
      //.addSection(taskTypeSection)
      .addSection(buttonSection);
  
  return addTaskCard.build();
}

// Case 3: Edit Submition Page

function editSubmit(event) {

  var userProperties = PropertiesService.getUserProperties();
  var profileImageUrl = userProperties.getProperty("DOCK_USER_PROFILE_IMAGE_URL");
  var userFullName = userProperties.getProperty("DOCK_USER_FULL_NAME");
  var userIdentifier = userProperties.getProperty("DOCK_USER_IDENTIFIER");
  var assigned_to_idenifier = userProperties.getProperty("DOCK_ASSIGNED_TO_IDENTIFIER");

  // Resetting Values

  var emptyString = ""
  var emptyResult;

  userProperties.setProperty("TASK_DESCRIPTION", emptyString);
  userProperties.setProperty("TASK_DATE", emptyResult);
  userProperties.setProperty("TASK_LIST", emptyResult);
  userProperties.setProperty("TASK_STATUS", emptyResult);
  userProperties.setProperty("TASK_PRIORITY", emptyResult);

  // API Integration
  
  if (assigned_to_idenifier == null) {

    assignedToIdentifier = userIdentifier

  } else {

    assignedToIdentifier = assigned_to_idenifier

  }

  if (event.formInput.checkbox_field == null) {

    var priorityResponse = 'LOW'

  } else {

    var priorityResponse = event.formInput.checkbox_field

  }

  var data = {
    'description': event.formInput.text_input_form_input_key,
    'taskListIdentifier': event.formInput.Lists,
    'workflowStatusIdentifier': event.formInput.status,
    'priority': priorityResponse,
    'assignedToIdentifier': assignedToIdentifier
    };

  console.log(data);

  var editTaskIdentifier = userProperties.getProperty("EDIT_TASKIDENTIFIER");

  userProperties.setProperty("TASK_IDENTIFIER", editTaskIdentifier);

  var response = this.accessProtectedResource('------------------------------' +editTaskIdentifier, 'put', 'application/json', JSON.stringify(data), null)

  console.log(response);

  var json = response.getContentText();
  var responseData = JSON.parse(json);

  taskIdentifier = responseData['taskIdentifier']
  listIdentifier = responseData['taskListIdentifier']

  userProperties.setProperty("TASK_IDENTIFIER", taskIdentifier);
  
  // Task Description

  var taskDetailsText = CardService.newTextParagraph()
    .setText('<font color="#EC4F3E"><b>Task Details</b></font>');

  var taskDescriptionText = CardService.newDecoratedText()
    .setText(event.formInput.text_input_form_input_key)
    .setTopLabel("<b>Description</b>")
    .setWrapText(true)

  // Widget Description

  var returnButtonAction = CardService.newAction()
    .setFunctionName('showTask')
  
  var returnButton = CardService.newTextButton()
      .setText('Return to Task')
      .setOnClickAction(returnButtonAction)
  
  var returnButtonSet = CardService.newButtonSet()
      .addButton(returnButton)
  
  var openButton = CardService.newTextButton()
          .setText('Open in DOCK Health')
          .setOpenLink(CardService.newOpenLink()
              .setUrl('----------------------------'/INCOMPLETE/' + taskIdentifier));

  var cardHeaderSet = CardService.newCardHeader()
    .setTitle("Changes Submitted!")
    .setImageUrl('https://static.thenounproject.com/png/6156-200.png');

  // Section Definition

  var taskDescription = CardService.newCardSection()
    .addWidget(taskDetailsText)
    .addWidget(taskDescriptionText)

  var footerTaskSection = CardService.newCardSection()
      .addWidget(openButton)
      .addWidget(returnButtonSet)

  // Card Definition
     
  var submitTaskCard = CardService.newCardBuilder()
      .setHeader(cardHeaderSet)
      .addSection(taskDescription)
      .addSection(footerTaskSection);
  
  return submitTaskCard.build();
  
}
