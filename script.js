let choice = {
    Occupation: "",
    Salary: 0
};


async function getCareers() {
        const url = "https://eecu-data-server.vercel.app/data";
        loadLocalStorage();
        console.log("Loaded saved choice:", choice);
        try {
            const response = await fetch(url);
            const jobs = await response.json();
            createOptions(jobs);
            return jobs;
        }
        catch (error) {
            console.error("Error fetching careers data:", error);
            return [];
        }
    }
    function saveLocalStorage() {
        localStorage.setItem("choice", JSON.stringify(choice));
    }
function loadLocalStorage() {
    const savedChoice = localStorage.getItem("choice");
    if (savedChoice) {
        choice = JSON.parse(savedChoice);

    }
    console.log(savedChoice);
}
    function createOptions(careers) {
        const list = document.getElementById("careerList");

        careers.forEach((career, index) => {
        const option = document.createElement("section");

         option.innerHTML = `${career.Occupation}: $${career.Salary}`;
         option.setAttribute("id", `${index}`);
         option.addEventListener("click", () => {

            choice.Occupation = career.Occupation;
            choice.Salary = career.Salary;
            saveLocalStorage();
            console.log(choice);
         });
         option.onclick = function() {
            window.location.href = "Budget.html";
         }
         option.classList.add("option");

        list.appendChild(option);
        });

        
    }
    getCareers();
    displayResults();

    function taxes() {
        const medicare = choice.Salary * 0.0145; // Example tax rate
        const socialSecurity = choice.Salary * 0.062; // Example tax rate
        const stateTax = choice.Salary * 0.04; // Example tax rate
        function federalTax () {
        if (choice.Salary <= 12400) { let tax = choice.Salary * 0.10; }
        else if (choice.Salary <= 50400) { let tax = 1240 + (choice.Salary - 12400) * 0.12; }
        else if (choice.Salary > 50400) { let tax = 1240 + 4560 + (choice.Salary - 50400) * 0.22; }
        return tax;
        }; // Example tax rate
        const totalTaxes = medicare + socialSecurity + stateTax + federalTax;
        const netSalary = choice.Salary - totalTaxes;
        return { totalTaxes, netSalary };
    }
    function displayResults() {
        getCareers()
        const resultsDiv = document.getElementById("Results");
        const { totalTaxes, netSalary } = taxes(Number);
        resultsDiv.innerHTML = `
        <h2>Results for ${choice.Occupation}</h2>
            <p>Total Taxes: $${totalTaxes.toFixed(2)}</p>
            <p>Net Salary: $${netSalary.toFixed(2)}</p>
            <p>Monthly Income: $${(netSalary / 12).toFixed(2)}</p>

        `;
    }
    console.log(choice);
    
