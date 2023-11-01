// EXTRA FUNCTION: COMMENT FUNCTION

function comment(event) {

  var commentInput = event.formInput.comment_input_key

  if (commentInput == null || commentInput == '') {


  } else {

    // API - Post Comment

    var userProperties = PropertiesService.getUserProperties();
    var taskIdentifier = userProperties.getProperty("TASK_IDENTIFIER");

    var data = {
      'comment': commentInput
   };

    console.log(data);

   var response = this.accessProtectedResource('https://api-dev.dockhealth.app/heydoc-services/task/comment/'+taskIdentifier, 'post', 'application/json', JSON.stringify(data), null)

   console.log(response)

   return HtmlService.createHtmlOutputFromFile('HTML - Reload');

    // Create Card

    var cardHeaderSet = CardService.newCardHeader()
      .setTitle("Comment Posted!")
      .setImageUrl('https://static.thenounproject.com/png/6156-200.png');

    var homeButtonAction = CardService.newAction()
      .setFunctionName('createDockCard')
  
    var homeButton = CardService.newTextButton()
       .setText('Return Home')
       .setOnClickAction(homeButtonAction)
  
   var homeButtonSet = CardService.newButtonSet()
        .addButton(homeButton)
  
    var searchButtonAction = CardService.newAction()
      .setFunctionName('showTask')
  
    var searchButton = CardService.newTextButton()
        .setText('Return to Task')
        .setOnClickAction(searchButtonAction)
    
    var searchButtonSet = CardService.newButtonSet()
        .addButton(searchButton)

    var buttonSection = CardService.newCardSection()
        .addWidget(searchButtonSet)
        .addWidget(homeButtonSet)
    
    var showListCard = CardService.newCardBuilder()
        .setHeader(cardHeaderSet)
        .addSection(buttonSection)
    
    //return showListCard.build();

  }
  
}
