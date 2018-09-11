// main function to be run when the form is submitted
// e will have the response values
// responses will be organized into a struct
function onSubmit(e) {
  var Properties = ["Client Name","Client Email","Affiliate Name", "Coach Email", "Nutrition Plan"];
  var clientInfo = {};
  var items = e.response.getItemResponses();
  for (i in items){
    // get the items organized
    clientInfo[Properties[i]] = items[i].getResponse();
  }
  
  // prove that the object was created
  Logger.log(clientInfo["Client Name"] + ' ' + clientInfo["Client Email"] + ' ' + clientInfo["Affiliate Name"]
            + ' ' + clientInfo['Coach Email'] + ' ' + clientInfo['Nutrition Plan']);
  
  // validate the values
  // emails are auto validated by the form
  // look for the affiliate folder
  var affiliateFolder = createAffiliateFolder(clientInfo['Affiliate Name']);
  Logger.log('main function folder ' + affiliateFolder.getName());
  
  // get the nutrition plan and template file for the client
  var planTemplate = getNutritionPlanTemplate(clientInfo['Nutrition Plan']);
  
  // create a copy of the template file with the client name and save it to the affiliate folder
  var clientFile = createIndividualPlan(affiliateFolder, planTemplate, clientInfo['Client Name'], clientInfo['Affiliate Name']);

  // send email
  sendEmail(clientInfo['Client Email'], clientFile);
}

// will look for ~/Nutrition Plans/<Affiliate Name> and create if needed
function createAffiliateFolder(affiliateName) {
  var rootFolders = DriveApp.getFoldersByName("Nutrition Plans");
  if(rootFolders.hasNext()) {
    var rootFolder = rootFolders.next();
    Logger.log('root folder ' + rootFolder.getName());
    var folders = rootFolder.getFoldersByName(affiliateName);
    if(!folders.hasNext()) {
      // create folder
      var newFolder = rootFolder.createFolder(affiliateName);
      Logger.log('new folder ' + newFolder.getName());
      return newFolder;
    } else {
      var folder = folders.next()
      Logger.log('already there ' + folder.getName());
      return folder;
    }
  }
  return 0;
}

// for testing planInfo will be a string with 'Option <num>'
// for procution planInfo will be a dict with values to plug into the calculator
function getNutritionPlanTemplate(planInfo) {
  var planNumber = getPlanNumber(planInfo);
  // planNumber now contains 'Option <num>'
  var templateFolders = DriveApp.getFoldersByName("Nutrition Plan Templates");
  if(templateFolders.hasNext()) {
    var templateFolder = templateFolders.next();
    Logger.log('template folder ' + templateFolder.getName());
    var files = templateFolder.getFilesByName('Nutrition Plan ' + planNumber);
    if(files.hasNext()) {
      Logger.log('found nutrition plan for plan number ' + planNumber);
      return files.next();
    }
  }
  return 0;
}

function getPlanNumber(planInfo) {
  // calculator function
  return planInfo;
}

function createIndividualPlan(folder, template, clientName, affiliateName) {
  // copy the template as a new file, and get the contents
  var clientFile = template.makeCopy(template.getName() + ' ' + clientName);
  var doc = DocumentApp.openById(clientFile.getId());
  var body = doc.getBody();
  
  // replace the template items with custom items
  body.replaceText('__CLIENTNAME__', clientName);
  body.replaceText('__AFFILIATENAME__', affiliateName);
  doc.saveAndClose();
  
  // save as pdf for email
  var theBlob = doc.getBlob().getAs('application/pdf').setName(clientFile.getName());
  return DriveApp.getFolderById(folder.getId()).createFile(theBlob);
}

function sendEmail(email, newFile) {
  GmailApp.sendEmail(email, 'nutrition pdf', "Here is your nutrition plan!", 
                    { attachments: [newFile.getBlob()]});
}

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