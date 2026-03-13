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
const colorList = ["red", 'blue', 'green', 'yellow', 'purple']
const advice = document.getElementById('advice-container')


//SAVE/LOAD FUNCTIONS

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

console.log(getCareers())

//GET CAREER, SEARCH BAR, AND SHOWCASE CAREERS

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

//filters by search values
function searchFilter(term) {
    let filteredCareers=[];
    if (!term) {
        createOptions(getCareers)
    }
    else {
        const careers = getCareers()
        for (var career in careers) {
            if (career.Occupation.contains(term)) {
                filteredCareers.push(career)
                console.log('found career with term')
            }
            else {
                console.log('cannot find term')
            };
        };
        createOptions(filteredCareers)
    }
}
searchBar.addEventListener('input', () => {
    searchFilter(searchBar.value)
});


//creates options
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


//CHART! I LOVE CHART!

let config = null; //start of chart, empty until data is inputted
if (chartCanvas && window.Chart) {
    config = new Chart(chartCanvas, {
        type: "doughnut",
        data: {
            labels: getAllLabelNames(),
            datasets: [{
                label: "$",
                data: [0, 0, 0, 0, 0, 0],
                backgroundColor: colorList,
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

function resetChart() { //resets the chart. unused but i'll keep it out of respect for the guy who did it
    if (config) {
        config.data.datasets[0].data = [0, 0, 0, 0, 0];
        config.update();
    }
    inputs.forEach(input => { if (input) input.value = ""; });
}

// updates chart, also including new expenses with thier value, budget, and new colors
function updateChart() {
    const vals = inputs.map(i => Number(i?.value) || 0);
    if (config) {
        config.data.labels = getAllLabelNames();
        config.data.datasets[0].data = vals;
        config.data.datasets[0].backgroundColor = colorList;
        config.update();
    }
}


inputs.forEach(input => { if (input) input.addEventListener("input", updateChart); });
inputs.forEach(input => {if (input) input.addEventListener('input', findRemainder)})
//updates the display and chart every time a number is changed in the form

let expenseCount = 0; //used to create unique ids for new expenses
//adds new expense input when you press the add button
addExpense.addEventListener("click", function() {
    expenseCount++;
    const expenseList = document.getElementById('Expenses');
    const newExpenseLabel = document.createElement('input');
    const container = document.createElement('form');
    container.setAttribute('class', 'row-Aligned')
    newExpenseLabel.placeholder = `Expense ${expenseCount}`; 
    newExpenseLabel.setAttribute('for', `New-Expense-${expenseCount}`);
    newExpenseLabel.classList.add('looks-invisible');
    newExpenseLabel.id.add(`labelFor-${expenseCount}`)
    newExpenseLabel.addEventListener('type', (e) => {
        newName(e)
    })

    const newExpense= document.createElement('input');
    newExpense.setAttribute('type', 'number');
    newExpense.setAttribute('for', 'new-expense');
    newExpense.setAttribute('class', 'Expense');
    newExpense.setAttribute('id', `New-Expense-${expenseCount}`); //new expense id!
    newExpense.addEventListener('input', updateChart);
    newExpense.addEventListener('input', findRemainder);
    

    container.appendChild( newExpenseLabel);
    container.appendChild( newExpense);
    expenseList.appendChild(container);
    expenseList.appendChild(addExpense) //keeps the button at the bottom of the list
    expenseList.appendChild(advice) // keeps the advice at the bottomer of the list
    inputs.push(newExpense);
    getRandomColor()
    updateChart()
    console.log(inputs);
});

//allows you to rename the custom variables
function newName(name) {
    console.log(name)
}

// gets random color and pushes it to the color list to be used in the chart
function getRandomColor() { 
    var colors = [];
      var letters = '0123456789ABCDEF'.split('');
      var color = '#';
      for (var x = 0; x < 6; x++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      colors.push(color);
      colorList.push(colors);
      return colorList;
}


//TAXES

// If this page has an Income section, show taxes and income
if (document.getElementById("Income")) {
    displayIncome();
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
    return totalTaxes
}

//calculates the total expenses and returns the total sum minus the net monthly salary (includes the new expense inputs)
function calculateRemaining() {
    const totalTaxes = taxes();
    const netSalary = (choice.Salary - totalTaxes).toFixed(2);
    const monthlyIncome = (netSalary / 12).toFixed(2);

    let totalExpenses = 0;
    inputs.forEach(input => {
        totalExpenses += Number(input?.value) || 0;
    });

    const remaining = monthlyIncome - totalExpenses;
    console.log("Remaining after expenses:", remaining);
    return remaining;
}

//find math for every expense
function findRemainder() {
    salary = calculateRemaining()

    if (salary >= 0) {
        total.classList.add('positive');
        total.classList.remove('negative');
        total.innerHTML = `$${salary.toFixed(2)}`
    }

    else if (salary < 0) {
        total.classList.add('negative');
        total.classList.remove('positive');
        total.innerHTML = `$${salary.toFixed(2)}`
    };
}

// Display income section
function displayIncome() {
    loadLocalStorage();

    const incomeDiv = document.getElementById("Income");

    if (!incomeDiv) return;

    const salary = Number(choice.Salary) || 0;

    const totalTaxes = taxes();
    const netSalary = (salary - totalTaxes).toFixed(2)

    incomeDiv.innerHTML = `
        <h2>Income</h2>
        <p><strong>Career: ${choice.Occupation || "N/A"}</strong></p>
        <p>Annual Salary: $${salary.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
        <p>Total Taxes: $${totalTaxes.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
        <p>Net Salary: $${netSalary.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
        <p><strong>Monthly Income: $${(netSalary / 12).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></p>
    `;
} //i have no idea why the guy who did this used this instead of .toFixed so dont ask

//MISCELANIOUS STUFF

//pops up wiseup tip if savings isn't at least 10% of your expenses
function checkYoSavings(saving) {
    totalTaxes = taxes()
    salary = ((choice.Salary - totalTaxes) / 12).toFixed(2)
    savingalings = salary * 0.10
    if (saving < savingalings) {
        wiseUp.classList.remove('hidden');
    }

    else if (saving >= savingalings) {
        wiseUp.classList.add('hidden');
    };
}

savings.addEventListener('input', () => {
    checkYoSavings(savings.value)
});

//prevents the user from going below the hundreth's place
function round(input) {
    return input.toFixed(2)
}

inputs.forEach(input => {if (input.classList.contains('Expense')) input.addEventListener('input', () => {
    round(input.value)
})})


// Run when page loads
displayIncome();
checkYoSavings();
searchFilter(getCareers())