console.log("Content script is running");

let ukvisasponsors = new Set();
let uknonvisasponsors = new Set();
let sponsorTimer = null;
let scrollTimer = null;
let oldHref = document.location.href;

let companyPositions = {};

fetch(chrome.runtime.getURL("extensions/data/applied_positions.json"))
  .then((response) => response.json())
  .then((json) => {
    json["applications"].forEach(app => {
      companyPositions[app.companyName] = app.positionApplied;
    });
    return companyPositions;
  })
  .then((companyPositions) => console.log(companyPositions))
  .catch((error) => console.error(error));



Promise.all([
  fetch(chrome.runtime.getURL("extensions/data/ukvisa.json"))
    .then((response) => response.json())
    .then((json) => {
      ukvisasponsors = new Set(json["sponsors"]);
    }),
])
.then(() => {
  let bodyList = document.querySelector("body");
  let observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (oldHref != document.location.href) {
        oldHref = document.location.href;
        runScript();
      }
    });
  });

  let config = { childList: true, subtree: true };
  observer.observe(bodyList, config);
})
.catch((error) => console.error(error));



Promise.all([
  fetch(chrome.runtime.getURL("extensions/data/uknonvisa.json"))
    .then((response) => response.json())
    .then((json) => {
      uknonvisasponsors = new Set(json["nonvisa_sponsors"]);
    }),
])
.then(() => {
  let bodyList = document.querySelector("body");
  let observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (oldHref != document.location.href) {
        oldHref = document.location.href;
        runScript();
      }
    });
  });

  let config = { childList: true, subtree: true };
  observer.observe(bodyList, config);
})
.catch((error) => console.error(error));



const style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = `
  .sponsor {
    background-color: Red;
  }
  .non-sponsor {
    background-color: Green;
  }
  .applied-position {
    background-color: purple !important;
  }
`;
document.head.appendChild(style);

function handleTextColorChange(element, isSponsor, isAppliedPosition, isnonSponsor) {
  if (isSponsor) {
    (element.closest('.job-card-container').classList).add("sponsor");
  } else if (isAppliedPosition) {
    (element.closest('.job-card-container').classList).add("applied-position");
  } else if (isnonSponsor){
    (element.closest('.job-card-container').classList).add("non-sponsor");
    // element.classList.add("non-sponsor");
  }
  else{
    console.log("end")
  }

// const jobCardContainer = element.closest('.job-card-container');
//   if (jobCardContainer) {
//     jobCardContainer.classList.add("highlight-job-card");
//   }
}

// function processCompanyNamesLinkedIn() {
//   let jobTitles = document.getElementsByClassName("job-card-list__title");
//   jobTitles = Array.from(jobTitles);
//   jobTitles.forEach((element) => {
//     let jobTitle = element.innerText.toUpperCase();
//     let isSponsor = ukvisasponsors.has(jobTitle);
//     let isAppliedPosition = appliedPositions.has(jobTitle);
//     handleTextColorChange(element, isSponsor, isAppliedPosition);
//   });

//   let companyNames = document.getElementsByClassName("job-card-container__company-name");
//   if (companyNames.length === 0) {
//     companyNames = document.getElementsByClassName("job-card-container__primary-description");

//   }


//   companyNames = Array.from(companyNames);

//   companyNames.forEach((element) => {
//     let companyName = element.innerText.toUpperCase();
//     let isSponsor = ukvisasponsors.has(companyName);
//     console.log(companyName);
//     handleTextColorChange(element, isSponsor);
//   });
// }



function processCompanyNamesLinkedIn() {
  let jobCards = document.querySelectorAll(".job-card-container");
  jobCards.forEach((card) => {
    let jobTitleElement = card.querySelector(".job-card-list__title");
    let companyNameElement = card.querySelector(".job-card-container__company-name") || card.querySelector(".job-card-container__primary-description");
    
    if (jobTitleElement && companyNameElement) {
      let jobTitle = jobTitleElement.innerText.toUpperCase();
      let companyName = companyNameElement.innerText.toUpperCase();
      console.log(companyName);
      // console.log(jobTitle);
      let isSponsor = ukvisasponsors.has(companyName);
      let isAppliedPosition = companyPositions.hasOwnProperty(companyName) && companyPositions[companyName] === jobTitle;
      let isnonSponsor = uknonvisasponsors.has(companyName);
      console.log(companyPositions.hasOwnProperty("SCC"));
      // console.log(companyName);
      handleTextColorChange(companyNameElement, isSponsor, isAppliedPosition, isnonSponsor);
      // handleTextColorChange(companyNameElement, isSponsor);
    }
  });
}

























function runScript() {
  processCompanyNamesLinkedIn();
  setInterval(processCompanyNamesLinkedIn, 1000);
  let scrollableElement = document.querySelector(".jobs-search-results-list");
  if (scrollableElement) {
    scrollableElement.addEventListener('scroll', (event) => {
      if (scrollTimer !== null) {
        clearTimeout(scrollTimer);
      }

      scrollTimer = setTimeout(() => {
        processCompanyNamesLinkedIn();
        if (!sponsorTimer) {
          sponsorTimer = setInterval(processCompanyNamesLinkedIn, 500);
        }
      }, 500);
    });
    setTimeout(processCompanyNamesLinkedIn, 2000);
  }
}

// Call runScript initially to set up the observer or other logic
runScript();