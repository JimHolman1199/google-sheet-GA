//dates for metrics
var today = new Date();
var ninetyDays = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);

var startDate = Utilities.formatDate(
    ninetyDays,
    Session.getScriptTimeZone(),
    "yyyy-MM-dd"
);
var endDate = Utilities.formatDate(
    today,
    Session.getScriptTimeZone(),
    "yyyy-MM-dd"
);

function getGAdata() {
    var createss = SpreadsheetApp.create("Google Analytics Data");
    var ssid = createss.getId();
    var sheet = SpreadsheetApp.openById(ssid);
    sheet.setFrozenRows(1);
    sheet
        .getRange("A1:K1")
        .setValues([
            [
                "Account Name",
                "Account ID",
                "Property Name",
                "Property ID",
                "View Name",
                "View ID",
                "Goals",
                "Users last 90 days",
                "TotalEvents last 90 days",
                "Filters(related to account)",
                "ADS"
            ]
        ]);
    var accounts = Analytics.Management.Accounts.list();
    if (accounts.items && accounts.items.length) {
        for (var i = 0; i < accounts.items.length; i++) {
            var webProperties = Analytics.Management.Webproperties.list(
                accounts.items[i].id
            );
            for (var j = 0; j < webProperties.items.length; j++) {
                var profiles = Analytics.Management.Profiles.list(
                    accounts.items[i].id,
                    webProperties.items[j].id
                );
                for (var k = 0; k < profiles.items.length; k++) {
                    //tableId for metrics
                    var tableId = "ga:" + profiles.items[k].id;
                    //array with accounts data 
                    var fields = [
                        accounts.items[i].name,
                        accounts.items[i].id,
                        webProperties.items[j].name,
                        webProperties.items[j].id,
                        profiles.items[k].name,
                        profiles.items[k].id,
                        goalList(accounts.items[i].id,webProperties.items[j].id,profiles.items[k].id),
                        getMetrics(tableId, 'users'),
                        getMetrics(tableId, 'totalEvents'),
                        filterList(accounts.items[i].id),
                        adsList(accounts.items[i].id, webProperties.items[j].id)
                    ];
                    //draw data in sheet
                    sheet.appendRow(fields);
                }
            }
        }
    }
}

function getMetrics(tableId, metricName){
    try{
        var report = Analytics.Data.Ga.get(
            tableId,
            startDate,
            endDate,
            "ga:"+ metricName
        )
    }catch(error){
        return error;
    }
    
    if(report.rows){
        return report.rows[0][0]
    } else {
        return 0
    }
}

function goalList(accounts,webProperties,profiles){
    try{
        var resultsGoals = Analytics.Management.Goals.list(
            accounts,
            webProperties,
            profiles
        );
        return resultsGoals.items.length;
    }catch(error){
        return error;
    }
    
}
function adsList(accounts, webProperties){
    try{
        var resultsAds = Analytics.Management.WebPropertyAdWordsLinks.list(accounts,webProperties);
        return resultsAds.items.length;
    }catch(error){
        return error;
    }
    
}
function filterList(accounts){
    try{
        var resultsFilters = Analytics.Management.Filters.list(accounts);
        return resultsFilters.items.length
    }catch(error){
        return error;
    }
}
