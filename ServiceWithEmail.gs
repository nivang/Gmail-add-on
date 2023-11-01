// CASE 2: CARD WITH EMAIL

// Homepage Screen

function createDockCardEmail(text, isHomepage) {
  if (!isHomepage) {
    isHomepage = false;
  }
  var email = Session.getEffectiveUser().getEmail(); 
  Logger.log(email);

  var userInfo = this.accessProtectedResource('-----------------------------'+email, 'get', null, null, null)
  Logger.log(userInfo)

  var json =  userInfo.getContentText();
  var data = JSON.parse(json);
  var fullName = data['firstName'] + ' ' + data['lastName']

  var userIdentifier = data['userIdentifier']
  var profilePictureHash = data['profileThumbnailPictureHash']
  if(!profilePictureHash){
    profilePictureHash = data['profilePictureHash']
  }

  var userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty("DOCK_USER_IDENTIFIER", userIdentifier);
  userProperties.setProperty("DOCK_USER_FULL_NAME", fullName);

  var profileImageUrl = "-------------------------------"+userIdentifier+"/"+profilePictureHash;
  userProperties.setProperty("DOCK_USER_PROFILE_IMAGE_URL", profileImageUrl);
  Logger.log(profileImageUrl)


  var now = new Date();
  // Header Definition

  var cardHeaderSet = CardService.newCardHeader()
    .setTitle("DOCK Health")
    .setSubtitle(fullName)
    .setImageStyle(CardService.ImageStyle.CIRCLE)
    .setImageUrl(profileImageUrl);
    
  // Widget Description -> Action Buttons

  var introText = CardService.newDecoratedText()
    .setText("Welcome to DOCK Health. Your team’s to-do list, done.")
    .setWrapText(true)

  var image = CardService.newImage().setImageUrl("https://static.wixstatic.com/media/7aa119_ae688b6b77c54133adae7ff1f409a0ca~mv2.png");

  var addButtonAction = CardService.newAction()
      .setFunctionName('addTaskEmail')
  
  var searchButtonAction = CardService.newAction()
      .setFunctionName('createSearchCard')

  var addButton = CardService.newTextButton()
      .setText('Create a New Task')
      .setOnClickAction(addButtonAction)
  
  var searchButton = CardService.newTextButton()
      .setText('Search for a Task')
      .setOnClickAction(searchButtonAction)
  
  var addButtonSet = CardService.newButtonSet()
      .addButton(addButton);
  
  var searchButtonSet = CardService.newButtonSet()
      .addButton(searchButton);

  // Footer Definition

  var footer = CardService.newFixedFooter()
      .setPrimaryButton(CardService.newTextButton()
          .setText('Powered by DOCK Health')
          .setOpenLink(CardService.newOpenLink()
              .setUrl('https://www.dock.health')));

  // Sections Definition

  var introductionSection = CardService.newCardSection()
    .addWidget(introText)
    .addWidget(image);
                        
  var section = CardService.newCardSection()
      .addWidget(addButtonSet)
      .addWidget(searchButtonSet);

  // Card Creation

  var card = CardService.newCardBuilder()
      .setHeader(cardHeaderSet)
      .addSection(introductionSection)
      .addSection(section)
      //.setFixedFooter(footer);

  // Launching Homepage

  if (!isHomepage) {
    var peekHeader = CardService.newCardHeader()
      .setTitle('Message Background')
      .setSubtitle(text);
    card.setPeekCardHeader(peekHeader)
  }

  return card.build();
}

var taskDescriptionInput;

// Case 2: Adding a Task Page

function addTaskEmail(event) {

  // Gather Information from Email
  
  Logger.log(event);
    // Header Definition

  var userProperties = PropertiesService.getUserProperties();
  var profileImageUrl = userProperties.getProperty("DOCK_USER_PROFILE_IMAGE_URL");
  var userFullName = userProperties.getProperty("DOCK_USER_FULL_NAME");
  var userIdentifier = userProperties.getProperty("DOCK_USER_IDENTIFIER");

  var cardHeaderSet = CardService.newCardHeader()
    .setTitle("Add Task")
    .setSubtitle(userFullName)
    .setImageStyle(CardService.ImageStyle.CIRCLE)
    .setImageUrl(profileImageUrl);

  var accessToken = event.gmail.accessToken;
  GmailApp.setCurrentMessageAccessToken(accessToken);

  var messageId = event.gmail.messageId;
  var message = GmailApp.getMessageById(messageId);
  var subject = message.getSubject();
  var body = message.getPlainBody();
  
  // Header Definition
  
  var userProperties = PropertiesService.getUserProperties();
  var profileImageUrl = userProperties.getProperty("DOCK_USER_PROFILE_IMAGE_URL");
  var userFullName = userProperties.getProperty("DOCK_USER_FULL_NAME");

  var cardHeaderSet = CardService.newCardHeader()
    .setTitle("Create a New Task")
    .setImageUrl('http://simpleicon.com/wp-content/uploads/pencil-256x256.png');

// Widget Definition

var introText = CardService.newDecoratedText()
    .setText("Welcome to the DOCK Health Gmail Addon! Please fill out the following form in order to add your task.")
    .setWrapText(true)

var image = CardService.newImage().setImageUrl("https://static.wixstatic.com/media/7aa119_ae688b6b77c54133adae7ff1f409a0ca~mv2.png");
  
 var task_description = userProperties.getProperty("TASK_DESCRIPTION");

  if (task_description == null || task_description == '' || task_description == 'undefined') {

    var taskDescriptionInput = CardService.newTextInput()
    .setFieldName("text_input_form_input_key")
    .setTitle("Description")
    .setValue(subject)

  } else {

    var taskDescriptionInput = CardService.newTextInput()
    .setFieldName("text_input_form_input_key")
    .setTitle("Description")
    .setValue(task_description)

  }

  
  //var assignedToInput = CardService.newTextInput()
    //.setFieldName("assigned_to_input_key")
    //.setTitle("Assigned To")

  var action = CardService.newAction().setFunctionName('assignedTo');

  if (event.formInput.assigned_to == null) {

    var assigned_to_idenifier = userIdentifier;

    userProperties.setProperty("DOCK_ASSIGNED_TO_IDENTIFIER", assigned_to_idenifier);

  } else {
    
    var assigned_to_idenifier = event.formInput.assigned_to;

    userProperties.setProperty("DOCK_ASSIGNED_TO_IDENTIFIER", assigned_to_idenifier);

  }

  if (assigned_to_idenifier == null) {

    var assignedToInput = CardService.newDecoratedText()
      .setText(userFullName)
      .setTopLabel("Assigned To")
      .setOnClickAction(action);

  } else {

    var response = this.accessProtectedResource('----------------------------------'+assigned_to_idenifier, 'get', 'application/json', null, null)

  Logger.log(response);

  var json = response.getContentText();
  var data = JSON.parse(json);

    var assignedToInput = CardService.newDecoratedText()
      .setText(data['firstName'] + ' ' + data['lastName'])
      .setTopLabel("Assigned To")
      .setOnClickAction(action);

  }

  var taskDate = userProperties.getProperty("TASK_DATE");

  if (taskDate == null) {

    var dateOnlyPicker = CardService.newDatePicker()
    .setTitle("Due Date")
    .setFieldName("date_picker_value")

  } else {

    var dateOnlyPicker = CardService.newDatePicker()
    .setTitle("Due Date")
    .setFieldName("date_picker_value")
    //.setValueInMsSinceEpoch(taskDate)

  }

  var listButtonaction = CardService.newAction()
    .setFunctionName('list')
  
  var listButton = CardService.newTextButton()
      .setText('Add to List')
      .setOnClickAction(listButtonaction)
  
  var listButtonSet = CardService.newButtonSet()
      .addButton(listButton)
      //.addButton(projectImageButton);
               
  var submitButtonAction = CardService.newAction()
    .setFunctionName('submitEmail')
  
  var submitButton = CardService.newTextButton()
      .setText('Create Task')
      .setOnClickAction(submitButtonAction)
  
  var submitButtonSet = CardService.newButtonSet()
      .addButton(submitButton)

  // Add Task: Status

  var taskStatus = userProperties.getProperty("TASK_STATUS");

  var response = this.accessProtectedResource('------------------------------------------------', 'get', 'application/json', null, null)

  Logger.log(response);

  var status = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.RADIO_BUTTON)
    .setFieldName("status")

  var json = response.getContentText();
  var data = JSON.parse(json);
  for(i in data){

    if (taskStatus == data[i]['identifier']) {

      status.addItem(data[i]['name'], data[i]['identifier'], true)

    } else {

      status.addItem(data[i]['name'], data[i]['identifier'], false)

    }
    
  }

  var taskPriority = userProperties.getProperty("TASK_PRIORITY");

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

    var task_list = userProperties.getProperty("TASK_LIST");

  var response = this.accessProtectedResource('--------------------------------------------', 'get', 'application/json', null, null)

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

  var addEmailText = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.CHECK_BOX)
    //.setTitle("A group of checkboxes. Multiple selections are allowed.")
    .setFieldName("add_email_field")
    .addItem("Add Email", 'true', true)

  // Text

  var taskDetailsText = CardService.newTextParagraph()
    .setText('<font color="#EC4F3E"><b>Task Details</b></font>');

  var taskAdditionalDetailsText = CardService.newTextParagraph()
    .setText('<br><font color="#EC4F3E"><b>Task Type</b></font>');

  // Section Definition

  var introductionSection = CardService.newCardSection()
    .addWidget(introText)
    .addWidget(image);

  var listSection = CardService.newCardSection()
    .addWidget(dropdownList)

  var addTaskSection = CardService.newCardSection()
      .addWidget(taskDetailsText)
      .addWidget(taskDescriptionInput)
      .addWidget(dateOnlyPicker)
      .addWidget(assignedToInput)
      .addWidget(taskAdditionalDetailsText)
      .addWidget(status)
      .addWidget(priority)
      .addWidget(addEmailText);

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

// Case 2: Sumbit Page

function submitEmail(event) {

  // Looking for Requirenments

  taskDescriptionTest = event.formInput.text_input_form_input_key;

  if (taskDescriptionTest == null || taskDescriptionTest == '') {


  } else {

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

    // Add Email?

    addEmailText = event.formInput.add_email_field

    // Getting Email Info

    var accessToken = event.gmail.accessToken;
    GmailApp.setCurrentMessageAccessToken(accessToken);

    var messageId = event.gmail.messageId;
    var message = GmailApp.getMessageById(messageId);
    var subject = message.getSubject();
    var sender = message.getFrom();
    var body = message.getPlainBody();

    // API Integration
  
    if (assigned_to_idenifier == null) {

      assignedToIdentifier = userIdentifier

    } else {

      assignedToIdentifier = assigned_to_idenifier

    }

    var emailLength = body.length;

    if (addEmailText == 'true' && emailLength < 5000){

      var data = {
      'description': event.formInput.text_input_form_input_key,
      'taskListIdentifier': event.formInput.Lists,
      'workflowStatusIdentifier': event.formInput.status,
      'priority': event.formInput.checkbox_field,
      'assignedToIdentifier': assignedToIdentifier,
      'emailBody': body
      };

    } else {

      var data = {
      'description': event.formInput.text_input_form_input_key,
      'taskListIdentifier': event.formInput.Lists,
      'workflowStatusIdentifier': event.formInput.status,
      'priority': event.formInput.checkbox_field,
      'assignedToIdentifier': assignedToIdentifier
      };

    }

    

    console.log(data);

    var response = this.accessProtectedResource('---------------------------------------', 'post', 'application/json', JSON.stringify(data), null)

    console.log(response);

    var json = response.getContentText();
    var responseData = JSON.parse(json);

    taskIdentifier = responseData['taskIdentifier']
    listIdentifier = responseData['taskListIdentifier']

    console.log(taskIdentifier);

    userProperties.setProperty("TASK_IDENTIFIER", taskIdentifier);

    // Task Description

    var taskDetailsText = CardService.newTextParagraph()
      .setText('<font color="#EC4F3E"><b>Task Details</b></font>');

    var taskDescriptionText = CardService.newDecoratedText()
      .setText(event.formInput.text_input_form_input_key)
      .setTopLabel("<b>Description</b>")
      .setWrapText(true)

    var emailText = CardService.newTextParagraph()
      .setText('<font color="#EC4F3E"><b>Email</b></font>');

    var bodyText = CardService.newDecoratedText()
      .setText(body)
      .setTopLabel("<b>Email Body</b>")
      .setWrapText(true)

    var subjectText = CardService.newDecoratedText()
      .setText(subject)
      .setTopLabel("<b>Subject</b>")
      .setWrapText(true)

    var senderText = CardService.newDecoratedText()
      .setText(sender)
      .setTopLabel("<b>Sender</b>")
      .setWrapText(true)

    // Widget Description

    var commentInput = CardService.newTextInput()
      .setFieldName("text_input_form_input_key")
      .setTitle("Comment")
    
    var commentButtonAction = CardService.newAction()
      .setFunctionName('comment')
    
    var commentButton = CardService.newTextButton()
        .setText('Add Comment')
        .setOnClickAction(commentButtonAction)
    
    var commentButtonSet = CardService.newButtonSet()
        .addButton(commentButton)
  
    var taskDoneButtonAction = CardService.newAction()
      .setFunctionName('taskDone')
    
    var taskDoneButton = CardService.newTextButton()
        .setText('Mark Task as Done')
        .setOnClickAction(taskDoneButtonAction)
    
    var taskDoneButtonSet = CardService.newButtonSet()
        .addButton(taskDoneButton)
    
    var openButton = CardService.newTextButton()
            .setText('Open in DOCK Health')
            .setOpenLink(CardService.newOpenLink()
                .setUrl('https://dev.dockhealth.app/#/core/tasks/'+event.formInput.Lists+'/INCOMPLETE/' + taskIdentifier));

    var cardHeaderSet = CardService.newCardHeader()
      .setTitle("Task Created!")
      .setImageUrl('https://static.thenounproject.com/png/6156-200.png');

    // Section Definition

    var taskDescription = CardService.newCardSection()
      .addWidget(taskDetailsText)
      .addWidget(taskDescriptionText)
      
    var commentTaskSection = CardService.newCardSection()
        .addWidget(commentInput)
        .addWidget(commentButtonSet)

    var footerTaskSection = CardService.newCardSection()
        .addWidget(taskDoneButtonSet)
        .addWidget(openButton)

    // Card Definition

    if (addEmailText == 'true') {

      if (emailLength > 5000) {

       var bodyText = CardService.newDecoratedText()
        .setText("Email did not save. Email has too many character.")
        .setTopLabel("<b>Error</b>")
        .setWrapText(true) 

        var emailSection = CardService.newCardSection()
          .addWidget(bodyText)

      } else {

        var emailSection = CardService.newCardSection()
        .addWidget(emailText)
        .addWidget(senderText)
        .addWidget(subjectText)
        .addWidget(bodyText)

      }

      var submitTaskCard = CardService.newCardBuilder()
        .setHeader(cardHeaderSet)
        .addSection(taskDescription)
        .addSection(emailSection)
        .addSection(commentTaskSection)
        .addSection(footerTaskSection);

    } else {

      var submitTaskCard = CardService.newCardBuilder()
        .setHeader(cardHeaderSet)
        .addSection(taskDescription)
        .addSection(commentTaskSection)
        .addSection(footerTaskSection);

    }
      
    
    
    return submitTaskCard.build();

  }
  
}
