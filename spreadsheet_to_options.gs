var dropdownOptionsName = "Dropdown options";
var ssId = "1aTClfmXZz7sk_jh-rNAgDlPu5HWLWzapFXmLALk4kNo"

function getDatesListFromSpreadSheet() {
  // identify the sheet where the data resides needed to populate the drop-down
  var ss = SpreadsheetApp.openById(ssId);
  
  // grab the values in the first column of the sheet - use 2 to skip header row 
  var namesValues = ss.getSheetValues(2, 1, ss.getLastRow() - 1, 2);
  
  return namesValues;
}

function removeAvailabilityForDate(dateSelected) {
  // identify the sheet where the data resides needed to populate the drop-down
  var ss = SpreadsheetApp.openById(ssId);
  
  // grab the values in the first column of the sheet - use 2 to skip header row 
  var fullRange = ss.getDataRange().getValues();
  for (var i=1; i<fullRange.length; i++) {
    if (fullRange[i][0] == dateSelected) {
      fullRange[i][1] = String(Number(fullRange[i][1]) - 1);
      break;
    }
  }
  ss.getDataRange().setValues(fullRange);
}

function onOpen() {
  // create menu option to update the form
  FormApp.getUi()
      .createMenu('Update Options')
      .addItem('Update From Spreadsheet', 'modifyForm')
      .addToUi();
}

function modifyForm() {
  
  // call your form and connect to the drop-down item
  var formItems = FormApp.getActiveForm().getItems();
  var datesList;
  for(var i = 0; i<formItems.length; i++) {
    if(formItems[i].getTitle() == dropdownOptionsName)
      datesList = formItems[i].asListItem();
  }

  var sheetValues = getDatesListFromSpreadSheet();
  var choiceValues = [];
  for (var i=0; i<sheetValues.length; i++) {
    Logger.log(sheetValues[i]);
    if(sheetValues[i][1] > 0) {
      choiceValues.push(sheetValues[i][0]);
    }
  }
  
  // populate the drop-down with the array data
  datesList.setChoiceValues(choiceValues);
}

function onSubmit(e) {
 // modify the number of availability 
  Logger.log(e.response.getItemResponses()[1].getResponse());
  
  // get the response
  var items = e.response.getItemResponses();
  var dateSelected = "";
  for(var i = 0; i<items.length; i++) {
    if(items[i].getItem().getTitle() == dropdownOptionsName)
      dateSelected = items[i].getResponse();
  }
  
  // modify the spreadsheet
  removeAvailabilityForDate(dateSelected);
  
  // update the form
  modifyForm();
  
}
