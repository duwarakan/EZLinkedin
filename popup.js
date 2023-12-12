document.getElementById("saveButton").addEventListener("click", function() {
    var newCompanyName = document.getElementById("companyNameInput").value;

    // Retrieve the existing company names array, or initialize a new one
    chrome.storage.sync.get(['companyNames'], function(result) {
        var companyNames = result.companyNames || [];
        companyNames.push(newCompanyName.toUpperCase());

        // Save the updated array back to storage
        chrome.storage.sync.set({companyNames}, function() {
            console.log('Company names updated:', companyNames);
        });
    });
});


