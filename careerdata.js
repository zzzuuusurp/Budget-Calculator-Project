const list = document.getElementById("careerList");
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

async function initalizeJobs() {
    const careersData = await getCareers();
    createOptions(careersData);
}


// Run when page loads
initalizeJobs();