let choice = {
    Occupation: "",
    Salary: 0
};

const loans = document.getElementById("Student-Loans");
const housing = document.getElementById("Housing");
const essentials = document.getElementById("Essential");
const lifestyle = document.getElementById("Lifestyle");
const savings = document.getElementById("Savings");
const chartCanvas = document.getElementById("Chart");
const inputs = [loans, housing, essentials, lifestyle, savings];

let config = null;
if (chartCanvas && window.Chart) {
    config = new Chart(chartCanvas, {
        type: "doughnut",
        data: {
            labels: ["Student-Loans", "Housing", "Essentials", "Lifestyle", "Savings"],
            datasets: [{
                label: "$",
                data: [0, 0, 0, 0, 0],
                backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#999999"]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "top" },
                title: { display: true, text: "Budget Breakdown" }
            }
        }
    });
}

function updateChart() {
    const vals = [loans, housing, essentials, lifestyle, savings].map(i => Number(i?.value) || 0);
    const total = vals.reduce((s, v) => s + v, 0);
    if (config) {
        config.data.datasets[0].data = vals;
        config.update();
    }
    saveBudget();
}

function resetChart() {
    if (config) {
        config.data.datasets[0].data = [0, 0, 0, 0, 0];
        config.update();
    }
    inputs.forEach(input => { if (input) input.value = ""; });
}

function saveBudget() {
    const budget = {
        Loans: Number(loans?.value) || 0,
        Housing: Number(housing?.value) || 0,
        Essentials: Number(essentials?.value) || 0,
        Lifestyle: Number(lifestyle?.value) || 0,
        Savings: Number(savings?.value) || 0
    };
    localStorage.setItem("budget", JSON.stringify(budget));
    console.log("Budget saved:", budget);
}

inputs.forEach(input => { if (input) input.addEventListener("input", updateChart); });




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
    // Load saved choice and initialize page-specific UI
    loadLocalStorage();
    if (document.getElementById("careerList")) {
        getCareers();
    }
    // If this page has an Income section, show taxes and income
    if (document.getElementById("Income")) {
        displayIncome();
    }

// Load saved career
function loadLocalStorage() {
    const savedChoice = localStorage.getItem("choice");
    if (savedChoice) {
        choice = JSON.parse(savedChoice);
    }
}

// Federal tax using bracket portions
function federalTax(salary) {
    let tax = 0;

    if (salary <= 12400) {
        tax += salary * 0.10;
    } else if (salary <= 50400) {
        tax += 12400 * 0.10; // first bracket
        tax += (salary - 12400) * 0.12; // second bracket
    } else {
        tax += 12400 * 0.10;
        tax += (50400 - 12400) * 0.12;
        tax += (salary - 50400) * 0.22;
    }

    return tax;
}

// Calculate all taxes
function taxes() {
    const salary = Number(choice.Salary) || 0;

    const medicare = salary * 0.0145;
    const socialSecurity = Math.min(salary, 160200) * 0.062; // apply Social Security cap
    const stateTax = salary * 0.04;

    const federal = federalTax(salary);

    const totalTaxes = medicare + socialSecurity + stateTax + federal;
    const netSalary = salary - totalTaxes;

    return { totalTaxes, netSalary };
}

// Display income section
function displayIncome() {
    loadLocalStorage();

    const incomeDiv = document.getElementById("Income");
    if (!incomeDiv) return;

    const salary = Number(choice.Salary) || 0;

    const { totalTaxes, netSalary } = taxes();

    incomeDiv.innerHTML = `
        <h2>Income</h2>
        <p>Career: ${choice.Occupation || "N/A"}</p>
        <p>Annual Salary: $${salary.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
        <p>Total Taxes: $${totalTaxes.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
        <p>Net Salary: $${netSalary.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
        <p>Monthly Income: $${(netSalary / 12).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
    `;
}

// Run when page loads
displayIncome();