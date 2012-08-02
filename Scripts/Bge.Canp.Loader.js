
var CanpAjaxTO = 20000;
var CanpCommEMsg = 'Data not available at this time. Please try again later';       // communication or msg.d error
var CanpGenEMsg = 'Error detected. Please contact your BGE service representative.'; // generic server error
var globalEMsg = ''; //to store the global error message

jQuery.support.cors = true;

function ADLogin(data) {
    $.ajax({
        type: "POST",
        url: "http://stage-newsletter.bge.com/RenderService.asmx/ADLogin",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: data,
        timeout: CanpAjaxTO,
		crossDomain: true,
        global: false,
        async:false,
        success: LoginSuccess,
        error: LoginError,
        complete: LoginComplete
    });
}
function LoginSuccess(msg) {
    if (jQuery.isEmptyObject(msg.d)) {
        return;
    } else if (!jQuery.isEmptyObject(msg.d.ErrorMessage)) {

        return;
    } else if (msg.d.status) {
        $("#uiLogoutButton").show();
        $("#uiLoginButton").hide();

        $("#uiAccountLoggedOut").hide();
        $("#uiAccountLoggedIn").show();
        $.cookie("loggedin", "true");
        return;
    }

}
function LoginError(xhr, ajaxOptions, thrownError) {
    // take away wait symbol and display error message
    $("#uiWaitBillSum").hide();
    $("#uiPnlBillSum > div").removeClass("greyout");
}
function LoginComplete(xhr, status) {
    if (status == 'timeout') {
        $("#uiSessionStatusBillSum").css("visibility", "visible");
        globalError(CanpCommEMsg);
    }
    else if (status != 'success') {
        $("#uiSessionStatusBillSum").css("visibility", "visible");
        $("#uiSessionStatusBillSum").text(CanpGenEMsg);
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
        async: false,
        success: AcctSumPopulate,
        error: AcctSumError,
        complete: AcctSumComplete
    });
}
function AcctSumPopulate(msg) {
    if (jQuery.isEmptyObject(msg.d)) {
        $("#uiSessionStatusAcctSum").css("visibility", "visible");
        //$("#uiSessionStatusAcctSum").text(CanpCommEMsg);
        return;

    } else if (!jQuery.isEmptyObject(msg.d.ErrorMessage)) {
        $("#uiSessionStatusAcctSum").css("visibility", "visible");
        $("#uiSessionStatusAcctSum").text(msg.d.ErrorMessage);
        return;
    }
    $('#uiAccountId').text("Acct# " + msg.d.AccountId);
    $('#uiAccountNumber').text("Acct# " + msg.d.AccountId);
    $('#uiName').text(msg.d.PrimaryAccountHoldersName);
    $('#uiAddress').text(msg.d.MailAddress);
    //Bill Data
    $('#uiAmount').text(msg.d.LastPayment);
    $('#uiReceived').text(msg.d.Received);
    $('#uiDue').text(msg.d.NetAmountDue);
    $('#uiDueDate').text(msg.d.DueDate);

    if (msg.d.MailAddress != null && msg.d.MailAddress.length > 0) {
        $('#uiAddress').empty();
        $.each(msg.d.MailAddress, function (idx) {
            $('#uiAddress').append('<li>' + this + '</li>');
        });
    }
    if (msg.d.NumberAccounts > 1) {
        $('#uiAccountSelect').show();
        $('#uiAccountId').hide();
    }
    if (msg.d.ServiceList != null && msg.d.ServiceList.length == 1 && msg.d.ServiceList[0].Address != "No Data") {
        $('#uiPremiseSingle').show();
        $('#uiPremise').hide();
        $('#uiNoPremise').hide();
        $('#uiPremiseSingle').text(msg.d.ServiceList[0].Address);
    }
    else if (msg.d.ServiceList != null && msg.d.ServiceList.length > 1) {
        $('#uiPremiseSingle').hide();
        $('#uiPremise').show();
        $('#uiNoPremise').hide();
        var pselect = $('#uiPremiseSelect');
        $.each(msg.d.ServiceList, function (idx) {
            pselect.append('<option value=' + this.Id + '>' + this.Address + '</option>');
        });
        pselect.change(OnChangePremise);
    }
    else if (msg.d.ServiceList[0].Address == "No Data") {
        $('#uiPremiseSingle').show();
        $('#uiPremise').hide();
        $('#uiPremiseSingle').text('no premise');
        $('#uiNoPremise').show();
    }

}
function AcctSumError(xhr, ajaxOptions, thrownError) {
    // take away wait symbol and display error message
    $("#uiWaitAcctSum").hide();
    $("#uiPnlAcctSum > div").removeClass("greyout");
}
function AcctSumComplete(xhr, status) {
    // take away wait symbol and display error message if any
    $("#uiWaitAcctSum").hide();
    $("#uiPnlAcctSum > div").removeClass("greyout");
    if (status == 'timeout') {
        $("#uiSessionStatusAcctSum").css("visibility", "visible");
        globalError(CanpCommEMsg);
    }
    else if (status != 'success') {
        $("#uiSessionStatusAcctSum").css("visibility", "visible");
        $("#uiSessionStatusAcctSum").text("Error");
    }
}

