function onGmailMessageSample(e) {
  console.log(e);
  
  var messageId = e.gmail.messageId;

  var accessToken = e.gmail.accessToken;
  GmailApp.setCurrentMessageAccessToken(accessToken);

  var message = GmailApp.getMessageById(messageId);
 
}
  

function onGmailCompose(e) {
  console.log(e);
  var header = CardService.newCardHeader()
  .setTitle('Create Task')

  var input = CardService.newTextInput()
      .setFieldName('text')
      .setTitle('Task')

  var action = CardService.newAction()
      .setFunctionName('onGmailInsert');
  
  var section = CardService.newCardSection()
      .addWidget(input)
      .addWidget(addButtonSet);
  
  var card = CardService.newCardBuilder()
      .setHeader(header)
      .addSection(section);
  return card.build();
}

function onGmailInsert(e) {
  console.log(e);

  var now = new Date();
  var imageUrl = 'https://cataas.com/cat';
  
  var response = CardService.newUpdateDraftActionResponseBuilder()
      .setUpdateDraftBodyAction(CardService.newUpdateDraftBodyAction()
          .addUpdateContent(imageHtmlContent, CardService.ContentType.MUTABLE_HTML)
          .setUpdateType(CardService.UpdateDraftBodyType.IN_PLACE_INSERT))
      .build();
  return response;
}
