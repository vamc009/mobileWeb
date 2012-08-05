
var CanpAjaxTO = 20000;
var CanpCommEMsg = 'Data not available at this time. Please try again later';       // communication or msg.d error
var CanpGenEMsg = 'Error detected. Please contact your BGE service representative.'; // generic server error
var globalEMsg = ''; //to store the global error message



jQuery.support.cors = true;

function ADLogout() {
    $.ajax({
        type: "POST",
        url: "http://stage-newsletter.bge.com/RenderService.asmx/ADLogout",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        timeout: CanpAjaxTO,
        crossDomain: true,
        async: false,
        global: false
    });
}

function ADLogin(data) {
    $.cookie("ASP.NET_SessionId", null);
    $.ajax({
        type: "POST",
        url: "http://stage-newsletter.bge.com/RenderService.asmx/ADLogin",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: data,
        timeout: CanpAjaxTO,
        crossDomain: true,
        global: false,
        async: false,
        success: LoginSuccess
    });
}
function LoginSuccess(msg) {
    if (jQuery.isEmptyObject(msg.d)) {
        return;
    } else if (!jQuery.isEmptyObject(msg.d.ErrorMessage)) {
        return;
    } else if (msg.d.status) {
        $.cookie("loggedin", "true");
        
        return;
    }

}

//Account Summary functions --
function GetAccountSummary() {
    $.ajax({
        type: "POST",
        url: "http://stage-newsletter.bge.com/RenderService.asmx/GetAccountSummary",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        timeout: CanpAjaxTO,
        global: false,
        crossDomain: true,
        success: AcctSumPopulate,
        error: AcctSumError,
        complete: AcctSumComplete
    });
}

function GetAccountSummarySync() {
    var data;
    $.ajax({
		type: "POST",
        url: "http://stage-newsletter.bge.com/RenderService.asmx/GetAccountSummary",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        timeout: CanpAjaxTO,
        global: false,
        crossDomain: true,
        async: false,
        success: function(msg) {
            data = msg.d
        }
    });
    return data 
}

function AcctSumPopulate(msg) {
    if (jQuery.isEmptyObject(msg.d)) {
        $("#AccountSummaryPage #uiSessionStatusAcctSum").text("Error");
        $("#AccountSummaryPage #uiSessionStatusAcctSum").show();
        $.cookie("loggedin", null);
        
        return;

    } else if (!jQuery.isEmptyObject(msg.d.ErrorMessage)) {
        $("#AccountSummaryPage #uiSessionStatusAcctSum").show();
        $("#AccountSummaryPage #uiSessionStatusAcctSum").text(msg.d.ErrorMessage);
        $.cookie("loggedin", null);
        
        return;
    }
	//AccountSummaryData =  msg.d;
	$.jStorage.set("AccountSummaryData",msg.d);
	renderAccuontSummary();
	$.mobile.changePage("AccountSummary.htm", { transition: "slide" });
}
function AcctSumError(xhr, ajaxOptions, thrownError) {

}
function AcctSumComplete(xhr, status) {
    if (status == 'timeout') {
        $("#AccountSummaryPage #uiSessionStatusAcctSum").show();
        $("#AccountSummaryPage #uiSessionStatusAcctSum").text("Timeout");
    }
    else if (status != 'success') {
        $("#AccountSummaryPage #uiSessionStatusAcctSum").show();
        $("#AccountSummaryPage #uiSessionStatusAcctSum").text("Error");
    }
	
}
function IsLoggedIn(){
	if( $.cookie( "loggedin" ) === "true"){
		return true;
	}
	else
		return false;
}

function renderAccuontSummary(){
	var ASumdata = $.jStorage.get("AccountSummaryData");
	if(!ASumdata){
		// if not - load the data from the server
		ASumdata = GetAccountSummarySync();
		// and save it
		$.jStorage.set("AccountSummaryData",ASumdata);
	} 
	var AccountSummaryData = ASumdata;
	if(!jQuery.isEmptyObject(AccountSummaryData)){
		$('#AccountSummaryPage #uiAccountId').text("Acct# " + AccountSummaryData.AccountId);
		$('#AccountSummaryPage #uiAccountNumber').text("Acct# " + AccountSummaryData.AccountId);
		$('#AccountSummaryPage #uiName').text(AccountSummaryData.PrimaryAccountHoldersName);
		$('#AccountSummaryPage #uiAddress').text(AccountSummaryData.MailAddress);
		//Bill Data
		$('#AccountSummaryPage #uiAmount').text(AccountSummaryData.LastPayment);
		$('#AccountSummaryPage #uiReceived').text(AccountSummaryData.Received);
		$('#AccountSummaryPage #uiDue').text(AccountSummaryData.NetAmountDue);
		$('#AccountSummaryPage #uiDueDate').text(AccountSummaryData.DueDate);

		if (AccountSummaryData.MailAddress != null && AccountSummaryData.MailAddress.length > 0) {
			$('#AccountSummaryPage #uiAddress').empty();
			$.each(AccountSummaryData.MailAddress, function (idx) {
				$('#AccountSummaryPage #uiAddress').append('<li>' + this + '</li>');
			});
		}
		if (AccountSummaryData.NumberAccounts > 1) {
			$('#AccountSummaryPage #uiAccountSelect').show();
			$('#AccountSummaryPage #uiAccountId').hide();
		}
		if (AccountSummaryData.ServiceList != null && AccountSummaryData.ServiceList.length == 1 && AccountSummaryData.ServiceList[0].Address != "No Data") {
			$('#AccountSummaryPage #uiPremiseSingle').show();
			$('#AccountSummaryPage #uiPremise').hide();
			$('#AccountSummaryPage #uiNoPremise').hide();
			$('#AccountSummaryPage #uiPremiseSingle').text(AccountSummaryData.ServiceList[0].Address);
		}
		else if (AccountSummaryData.ServiceList != null && AccountSummaryData.ServiceList.length > 1) {
			$('#AccountSummaryPage #uiPremiseSingle').hide();
			$('#AccountSummaryPage #uiPremise').show();
			$('#AccountSummaryPage #uiNoPremise').hide();
			var pselect = $('#AccountSummaryPage #uiPremiseSelect');
			$.each(AccountSummaryData.ServiceList, function (idx) {
				pselect.append('<option value=' + this.Id + '>' + this.Address + '</option>');
			});
			pselect.change(OnChangePremise);
		}
		else if (AccountSummaryData.ServiceList[0].Address == "No Data") {
			$('#AccountSummaryPage #uiPremiseSingle').show();
			$('#AccountSummaryPage #uiPremise').hide();
			$('#AccountSummaryPage #uiPremiseSingle').text('no premise');
			$('#AccountSummaryPage #uiNoPremise').show();
		}
		$("#AccountSummaryPage #uiSessionStatusAcctSum").hide();
	}
}

$('#homePage').live('pageshow', function () {

    $("#homePage #uiSignButton").click(function () {
        var userId = $('#homePage input[name=userId]');
        var password = $('#homePage input[name=password]');
        //var data = 'userId=' + userId.val() + '&password=' + password.val();
        var jsonData = { "userId": userId.val(), "password": password.val() };
        var data = JSON.stringify(jsonData)
        ADLogin(data);
        if (IsLoggedIn()) {
            $("#uiAccountLoggedOut").hide();
            $("#uiAccountLoggedIn").show();
            $("#uiLogoutButton").show();
            $("#uiLoginButton").hide();
            $.mobile.changePage("AccountSummary.htm", { transition: "slide" });
        }
        else {
            $("#homePage #uiLblError").show();
            $("#homePage #uiLblError").text("Invalid UserId/Password");
        }
        return false;
		
    });
	
	$('#homePage #uiMyaccountBtn').click(function () {
			if (IsLoggedIn()) {
				$.mobile.loadPage("AccountSummary.htm");
				renderAccuontSummary();
				$.mobile.changePage("#AccountSummaryPage");
			}
			else{
				
				$.mobile.changePage("login.htm");
				
			}
			
		});
		
    if (IsLoggedIn()) {
     //   $("#homePage #uiAccountLoggedOut").hide();
     //   $("#homePage #uiAccountLoggedIn").show();
        $("#homePage #uiLogoutButton").show();
        $("#homePage #uiLoginButton").hide();
    } else {
     //   $("#homePage #uiAccountLoggedOut").show();
     //   $("#homePage #uiAccountLoggedIn").hide();
        $("#homePage #uiLogoutButton").hide();
        $("#homePage #uiLoginButton").show();
    }


    $("#homePage #uiLogoutButton").click(function () {
        ADLogout();
        $("#uiLoginButton").show();
        $("#uiLogoutButton").hide();
        $.cookie("loggedin", null);
        
        //$("#uiAccountLoggedOut").show();
        //$("#uiAccountLoggedIn").hide();
        return false;
    });
});

$('#AccountSummaryPage').live('pageshow', function () {
    if (IsLoggedIn()) {
        $('#AccountSummaryPage #uiSessionStatusAcctSum').text("Loading..");
        $('#AccountSummaryPage #uiSessionStatusAcctSum').show();
        renderAccuontSummary();
        if (!IsLoggedIn()) {
            $.mobile.changePage("login.htm", { transition: "slide"});
        }
    }
    else {
        $.mobile.changePage("login.htm", { transition: "slide" });
    }
    $("#AccountSummaryPage #uiSignoutButton").click(function () {
        ADLogout();
        $.cookie("loggedin", null);
        $.mobile.changePage("index.html", { transition: "slide", reloadPage: true });
        return false;
    });
});


$('#loginPage').live('pageshow', function () {
    $("#loginPage #uiSignButtonD").click(function () {
        var userId = $('#loginPage input[name=userId]');
        var password = $('#loginPage input[name=password]');
        //var data = 'userId=' + userId.val() + '&password=' + password.val();
        var jsonData = { "userId": userId.val(), "password": password.val() };
        var data = JSON.stringify(jsonData);
        
		ADLogin(data);
        if (IsLoggedIn()) {
			$.mobile.loadPage("AccountSummary.htm");
			 GetAccountSummary();
        }
        else {
            $("#loginPage #uiLblError").show();
            $("#loginPage #uiLblError").text("Invalid UserId/Password");
        }
        return false;
    });
});