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
const addExpense = document.getElementById('Add-expense');
const wiseUp = document.getElementById('WiseUp');
const total = document.getElementById('remainder');
const searchBar = document.getElementById('searchBar')

let config = null;
if (chartCanvas && window.Chart) {
    config = new Chart(chartCanvas, {
        type: "doughnut",
        data: {
            labels: getAllLabelNames(),
            datasets: [{
                label: "$",
                data: [0, 0, 0, 0, 0, 0],
                backgroundColor: getRandomColor(inputs.length),
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

function getAllLabelNames() { //gets all the names for the expenses and returns them, intended to use for the chart
    const labels = [];
    inputs.forEach(input => {
        if (input) {
            const label = input.previousElementSibling?.textContent || "Unnamed Expense";
            labels.push(label);
        }
    });
    return labels;
}

// gets random coo
function getRandomColor(numColors) { 
    var colors = [];
    for (var i = 0; i < numColors; i++) {
      var letters = '0123456789ABCDEF'.split('');
      var color = '#';
      for (var x = 0; x < 6; x++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      colors.push(color);
    }
    return colors;
}

// updates chart, also including new expenses with thier value, budget, and new colors
function updateChart() {
    const vals = inputs.map(i => Number(i?.value) || 0);
    if (config) {
        config.data.labels = getAllLabelNames();
        config.data.datasets[0].data = vals;
        config.data.datasets[0].backgroundColor = getRandomColor(inputs.length)
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

//saved budget(adjusts to include new expenses added)
const saveBudget = () => {
    const budget = () =>{
        for (var input in inputs) {
            if (inputs[input]) {
                const key = inputs[input].getAttribute("id");
                const value = Number(inputs[input].value) || 0;
                this[key] = value;
            }
        }
    }
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

    //creates options(unbiased)
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
        <p><strong>Career: ${choice.Occupation || "N/A"}</strong></p>
        <p>Annual Salary: $${salary.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
        <p>Total Taxes: $${totalTaxes.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
        <p>Net Salary: $${netSalary.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
        <p><strong>Monthly Income: $${(netSalary / 12).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></p>
    `;
}

//calculates the total expenses and returns the total sum minus the net monthly salary (includes the new expense inputs)
function calculateRemaining() {
    const { netSalary } = taxes();
    const monthlyIncome = netSalary / 12;

    let totalExpenses = 0;
    inputs.forEach(input => {
        totalExpenses += Number(input?.value) || 0;
    });

    const remaining = monthlyIncome - totalExpenses;
    console.log("Remaining after expenses:", remaining);
    return remaining;
}


let expenseCount = 0;
//adds new expense input
addExpense.addEventListener("click", function() {
    expenseCount++;
    const expenseList = document.getElementById('Expenses');
    const newExpenseLabel = document.createElement('label');
    const container = document.createElement('form');
    container.setAttribute('class', 'row-Aligned')
    newExpenseLabel.textContent = `Expense ${expenseCount}`; 
    newExpenseLabel.setAttribute('for', `New-Expense-${expenseCount}`);

    const newExpense= document.createElement('input');
    newExpense.setAttribute('type', 'number');
    newExpense.setAttribute('for', 'new-expense');
    newExpense.setAttribute('class', 'Expense');
    newExpense.setAttribute('id', `New-Expense-${expenseCount}`);
    newExpense.addEventListener('input', updateChart)

    container.appendChild( newExpenseLabel);
    container.appendChild( newExpense);
    expenseList.appendChild(container);

    inputs.push(newExpense);
    updateChart()
    console.log(inputs);
});

// Run when page loads
displayIncome();