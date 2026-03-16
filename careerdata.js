const list = document.getElementById("careerList");
const searchBar = document.getElementById('searchBar');
let allCareers = []
let choice = {
    Occupation: "",
    Salary: 0
};

//save saved career
function saveLocalStorage() {
    localStorage.setItem("choice", JSON.stringify(choice));
}
//load saved career
function loadLocalStorage() {
    const savedChoice = localStorage.getItem("choice");
    if (savedChoice) {
        choice = JSON.parse(savedChoice);
    }
    console.log(savedChoice);
}

async function getCareers() {
    const url = "https://eecu-data-server.vercel.app/data";
    loadLocalStorage();
    console.log("Loaded saved choice:", choice);
    try {
        const response = await fetch(url);
        const jobs = await response.json();
        allCareers = jobs; //should fill out the allCareers list for the search function
        console.log(allCareers)
        return jobs;
    }
    catch (error) {
        console.error("Error fetching careers data:", error);
        return [];
    }
}


//creates options
function createOptions(careers) {
    list.innerHTML = ''; //clears the previous list
    careers.forEach((career, index) => {
    const option = document.createElement("section");
     option.innerHTML = `${career.Occupation}: $${career.Salary}`;
     option.setAttribute("id", `${index}`);
     option.addEventListener("click", () => {
        choice.Occupation = career.Occupation;
        choice.Salary = career.Salary;
        saveLocalStorage();
        console.log(choice);
        window.location.href = "Budget.html"; //send the user to the budget page
     });
     option.classList.add("option");

    list.appendChild(option);
    });
};

//filter based off search term(should work for search)
function filterJobs(term) {
    let filteredJobs = [];
    if (!term) {
        console.log('no term found.')
        createOptions(allCareers);
        return
    } //returns all careers if nothing is in the search bar
    const lowerTerm = term.toLowerCase(); //ignores capitalization for more leniant 
    for (var item in allCareers) {
        console.log(item);
        const findTerm = allCareers[item]
        const match = findTerm.Occupation;
        console.log(match);
        const lowerMatch = match.toLowerCase();
        if (lowerMatch.includes(lowerTerm)) {
            filteredJobs.push(findTerm)
        }
    }
    console.log(filteredJobs)
    createOptions(filteredJobs)
}

searchBar.addEventListener('input', () => {
    filterJobs(searchBar.value)
})

//starts the creationing
async function initalizeJobs() {
    const careersData = await getCareers();
    createOptions(careersData);
};


// Run when page loads
initalizeJobs();