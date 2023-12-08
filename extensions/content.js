console.log("Content script is running");

let ukvisasponsors = null;
let sponsorTimer = null;
let scrollTimer = null;
let oldHref = document.location.href;

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

const removeCorporationSuffix = (inputString) => {
  // Same function as before
};

// Add CSS styles for company name coloring
const style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = `
  .sponsor {
    color: green;
  }
  .non-sponsor {
    color: blue;
  }
  .highlight-job-card {
    background-color: yellow; /* Change to any color you prefer */
  }
`;
document.head.appendChild(style);

console.log("godhelp");
function handleTextColorChange(element, isSponsor) {
  if (isSponsor) {
   element.classList.add("sponsor");
  } else {
    element.classList.add("non-sponsor");
  }

console.log("handleTextColorChange");
const jobCardContainer = element.closest('.job-card-container');
console.log("jobCardContainer");
  if (jobCardContainer) {
    jobCardContainer.classList.add("highlight-job-card");
  }
}

function processCompanyNamesLinkedIn() {
  let companyNames = document.getElementsByClassName("job-card-container__company-name");
  if (companyNames.length === 0) {
    companyNames = document.getElementsByClassName("job-card-container__primary-description");
  }
console.log(companyNames);

  companyNames = Array.from(companyNames);
  companyNames.forEach((element) => {
    let companyName = removeCorporationSuffix(element.innerText.toUpperCase());
    let isSponsor = ukvisasponsors.has(companyName);
    handleTextColorChange(element, isSponsor);
  });
}

function runScript() {
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
