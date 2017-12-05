function myFunction() {
  var ss = SpreadsheetApp.openByUrl(
     'https://docs.google.com/spreadsheets/d/1Un_cQ8YO_19tNDnTbMeVw2FIzNt7c4oN39H89ycHvEQ/');
  var data = ss.getDataRange().getValues();
  // go to the last row
  var dataInd = data.length - 1;
  // timestamp is column 0, email column 1, company column 2, plan option column 3,client name column 4
  var email = data[dataInd][1];
  var company = data[dataInd][2];
  var plan = data[dataInd][3];
  var name = data[dataInd][4];
  Logger.log('Client ' + name + ' from ' + company + ' would like nutrition plan ' + plan);
  
  var file = DriveApp.getFilesByName('Nutrition Plan ' + plan).next();
  var clientFile = file.makeCopy(file.getName() + ' ' + name);
  
  var doc = DocumentApp.openById(clientFile.getId());
  var body = doc.getBody();
  
  body.replaceText('__CLIENTNAME__', name);
  doc.saveAndClose();
  
  var theBlob = doc.getBlob().getAs('application/pdf').setName(clientFile.getName());
  var newFile = DriveApp.createFile(theBlob);
  
  Logger.log('Sending email to ' + email + ' with ' + clientFile.getName());
  GmailApp.sendEmail(email, 'nutrition pdf', "Here is your nutrition plan!", 
                    { attachments: [newFile.getBlob()]});
}
