// EXTRA FUNCTION: SEARCH TASK

function createSearchCard() {
  
  var searchInput = CardService.newTextInput()
    .setFieldName("text_input_form_input_key")
    .setValue("");
  
  var searchButtonAction = CardService.newAction()
    .setFunctionName('searchTasksByTerm')
  
  var searchButton = CardService.newTextButton()
      .setText('Search')
      .setOnClickAction(searchButtonAction)
  
  var searchButtonSet = CardService.newButtonSet()
      .addButton(searchButton)
  
  var searchProjectSection = CardService.newCardSection()
      .addWidget(searchInput)
      .addWidget(searchButtonSet)
  
  var searchProjectCard = CardService.newCardBuilder()
      .addSection(searchProjectSection)
  
  return searchProjectCard.build();
  
}

// EXTRA FUNCTION: DISPLAY TASKS

function searchTasksByTerm(event) {
  
  var searchTerm = event.formInput.text_input_form_input_key;
  Logger.log(searchTerm);

  if (searchTerm == null || searchTerm == '') {

    searchTerm = ' ';

  } 

  var searchInput = CardService.newTextInput()
    .setFieldName("text_input_form_input_key")
    .setValue(searchTerm);
  
  var searchButtonAction = CardService.newAction()
    .setFunctionName('searchTasksByTerm')
  
  var searchButton = CardService.newTextButton()
      .setText('Search')
      .setOnClickAction(searchButtonAction)
  
  var searchButtonSet = CardService.newButtonSet()
      .addButton(searchButton)

  var response = this.accessProtectedResource('----------------'+searchTerm+'&status=INCOMPLETE&startPosition=0', 'get', 'application/json', null, null)

  Logger.log(response);

  var listsSection = CardService.newCardSection()
      // .addWidget(checkboxGroup)
      // .addWidget(grid)

  var json = response.getContentText();
  var data = JSON.parse(json);
  var taskLists = data['taskLists'];
  for(i in taskLists){
    var grid = CardService.newGrid()
    .setTitle(taskLists[i]['listName'])
    .setNumColumns(1)
    .setOnClickAction(CardService.newAction().setFunctionName('showTask'))
    .setBorderStyle(CardService.newBorderStyle().setType(CardService.BorderType.STROKE))

    var tasks = taskLists[i]['tasks']
    for(j in tasks){
      // checkboxGroup.addItem(tasks[j]['description'], tasks[j]['taskListIdentifier'], false)
      grid.addItem(CardService.newGridItem().setTitle(tasks[j]['description']).setIdentifier(tasks[j]['identifier']));
    }
    listsSection.addWidget(grid)
  }
  
  var searchSection = CardService.newCardSection()
      .addWidget(searchInput)
      .addWidget(searchButtonSet)
  
  
  var showListCard = CardService.newCardBuilder()
      .addSection(searchSection)
      .addSection(listsSection)
  
  return showListCard.build();
  
}

// EXTRA FUNCTION: DISPLAY TASK

function showTask(event) {

  var userProperties = PropertiesService.getUserProperties();

  console.log(event)
  console.log(event.parameters)

  if (event.parameters.grid_item_identifier == null) {

    var taskIdentifier = userProperties.getProperty("TASK_IDENTIFIER");

   } else {

    var taskIdentifier = event.parameters.grid_item_identifier

  }

  userProperties.setProperty("EDIT_TASKIDENTIFIER", taskIdentifier);

  var profileImageUrl = userProperties.getProperty("DOCK_USER_PROFILE_IMAGE_URL");
  var userFullName = userProperties.getProperty("DOCK_USER_FULL_NAME");
  userProperties.setProperty("TASK_IDENTIFIER", taskIdentifier);

  // Header Definition

  var cardHeaderSet = CardService.newCardHeader()
    .setTitle("Task Description")
    .setSubtitle(userFullName)
    .setImageStyle(CardService.ImageStyle.CIRCLE)
    .setImageUrl(profileImageUrl);
  
  // Task Description

  var response = this.accessProtectedResource('------------------------'+taskIdentifier, 'get', 'application/json', null, null)

  var json = response.getContentText();
  var responseData = JSON.parse(json);

  console.log(responseData)

  var taskDetailsText = CardService.newTextParagraph()
    .setText('<font color="#EC4F3E"><b>Task Details</b></font>');

  var taskDescription = CardService.newDecoratedText()
    .setText(responseData['description'])
    .setTopLabel("Description")
    .setWrapText(true)

  var priorityTextCaps = responseData['priority']
  var priorityTextLower = priorityTextCaps.toLowerCase()

  if (priorityTextLower == 'low') {

    priorityTextLower = 'Low';

  } else {

    priorityTextLower = 'High'

  }

  var priorityText = CardService.newDecoratedText()
    .setText(priorityTextLower)
    .setTopLabel("Priority")
    .setWrapText(true)

  var statusData = responseData['workflowStatus']['identifier']

  var response = this.accessProtectedResource('-----------------------------------', 'get', 'application/json', null, null)

  var json = response.getContentText();
  var data = JSON.parse(json);

  for(i in data){

    if (statusData == data[i]['identifier']) {
      var statusTextValue = '';
      statusTextValue = data[i]['name']
    }
  }

  var statusText = CardService.newDecoratedText()
    .setText(statusTextValue)
    .setTopLabel("Status")
    .setWrapText(true)

  var numberOfAssigned = 0

  for(i in responseData['assignedToUsers']) {

    numberOfAssigned += 1

  }

  if (numberOfAssigned > 1) {

    var nameNumber = 0;

    var name = ''

    for(i in responseData['assignedToUsers']) {
      
      if (nameNumber == 0) {

        name = name + responseData['assignedToUsers'][i]['userName']

      } else {

        name = name + ', ' + responseData['assignedToUsers'][i]['userName']

      }

      nameNumber += 1;

    }

  } else {

    for(i in responseData['assignedToUsers']){
      var name = responseData['assignedToUsers'][i]['userName']
    }


  }

  var assignedToText = CardService.newDecoratedText()
    .setText(name)
    .setTopLabel("Assigned To")
    .setWrapText(true)

  // Show Comments

  var json = response.getContentText();
  var data = JSON.parse(json);
  var grid = CardService.newGrid()
    .setNumColumns(1)
    .setBorderStyle(CardService.newBorderStyle().setType(CardService.BorderType.STROKE))
    .setOnClickAction(CardService.newAction().setFunctionName('showTask'))

    var commentsText = CardService.newTextParagraph()
    .setText('<font color="#EC4F3E"><b>Comments</b></font>');

    var comments = responseData['comments']
    
    for(j in comments){
      grid.addItem(CardService.newGridItem().setTitle(comments[j]['comment']).setIdentifier(comments[j]['commentIdentifier']));
    }

  // Extra Actions

  var commentInput = CardService.newTextInput()
    .setFieldName("comment_input_key")
    .setTitle("Comment")
  
  var commentButtonAction = CardService.newAction()
    .setFunctionName('comment')
  
  var commentButton = CardService.newTextButton()
      .setText('Add Comment')
      .setOnClickAction(commentButtonAction)
  
  var commentButtonSet = CardService.newButtonSet()
      .addButton(commentButton)
 
  var searchButtonAction = CardService.newAction()
    .setFunctionName('taskDone')
  
  var searchButton = CardService.newTextButton()
      .setText('Complete Task')
      .setOnClickAction(searchButtonAction)
  
  var searchButtonSet = CardService.newButtonSet()
      .addButton(searchButton)

  var editButtonAction = CardService.newAction()
    .setFunctionName('editTask')
  
  var editButton = CardService.newTextButton()
      .setText('Edit Task')
      .setOnClickAction(editButtonAction)
  
  var editButtonSet = CardService.newButtonSet()
      .addButton(editButton)

  var actionButtons = CardService.newButtonSet()
    .addButton(editButton)
    .addButton(searchButton)

  var placeholder = CardService.newTextInput()
    .setFieldName('getting_task_identifier')
    .setTitle("Placeholder")
    .setValue(taskIdentifier);
  
  var openButton = CardService.newTextButton()
          .setText('Open in DOCK Health')
          .setOpenLink(CardService.newOpenLink()
              .setUrl('-------------------------------'+responseData['taskList']['taskListIdentifier']+'/INCOMPLETE/' + taskIdentifier));
  
  var userProperties = PropertiesService.getUserProperties();
  var profileImageUrl = userProperties.getProperty("DOCK_USER_PROFILE_IMAGE_URL");
  var userFullName = userProperties.getProperty("DOCK_USER_FULL_NAME");

  var cardHeaderSet = CardService.newCardHeader()
    .setTitle("Submit")
    .setSubtitle(userFullName)
    .setImageStyle(CardService.ImageStyle.CIRCLE)
    .setImageUrl(profileImageUrl);

  // Section Definition

  var taskDescriptionSection = CardService.newCardSection()
      .addWidget(taskDetailsText)
      .addWidget(taskDescription)
      .addWidget(assignedToText)
      .addWidget(statusText)
      .addWidget(priorityText)
  
  var commentTaskSection = CardService.newCardSection()
      .addWidget(commentsText)
      .addWidget(grid)
      .addWidget(commentInput)
      .addWidget(commentButtonSet)

  var actionTaskSection = CardService.newCardSection()
      .addWidget(actionButtons)

  var footerTaskSection = CardService.newCardSection()
      .addWidget(openButton)

  console.log(responseData['sourceMessage'])

  if (responseData['sourceMessage'] == null || responseData['sourceMessage'] == '') {

    var submitTaskCard = CardService.newCardBuilder()
      .setHeader(cardHeaderSet)
      .addSection(taskDescriptionSection)
      .addSection(commentTaskSection)
      .addSection(actionTaskSection)
      .addSection(footerTaskSection);

  } else {

    var emailText = CardService.newTextParagraph()
      .setText('<font color="#EC4F3E"><b>Email</b></font>');

    var emailBody = CardService.newDecoratedText()
      .setText(responseData['sourceMessage'])
      .setWrapText(true)

    var emailSection = CardService.newCardSection()
      .addWidget(emailText)
      .addWidget(emailBody)

    var submitTaskCard = CardService.newCardBuilder()
      .setHeader(cardHeaderSet)
      .addSection(taskDescriptionSection)
      .addSection(emailSection)
      .addSection(commentTaskSection)
      .addSection(actionTaskSection)
      .addSection(footerTaskSection);

  }
     
  
  
  return submitTaskCard.build();
  
}
