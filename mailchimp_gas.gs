var API_KEY = "";
var mc_base_url = 'http://us14.api.mailchimp.com/3.0/';
var mc_list_id = '7b6b502530';
var mc_double_optin = false;

/**
 * Uses the MailChimp API to add a subscriber to a list.
 */
function sendToMailChimp_(name, email){
  var mc_add_member_url = mc_base_url + 'lists/' + mc_list_id + '/members/';
  var params = {
    "contentType" : "application/json",
    "headers": { "Authorization": "apikey " + API_KEY },
    "method": "post",
    "payload" : JSON.stringify({
      "email_address": email,
      "status": "subscribed",
      "merge_fields" : {
        "FNAME": name
      }
    })
  };
  var response = UrlFetchApp.fetch(mc_add_member_url,params);
  Logger.log(response)
}

function testMailChimp() {
  sendToMailChimp_("TOMMY","tjohnsen8@gmail.com");
}
