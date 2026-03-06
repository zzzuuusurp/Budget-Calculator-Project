let choice = {
    Occupation: "",
    Salary: 0
};


async function getCareers() {
        const url = "https://eecu-data-server.vercel.app/data";
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

    function createOptions(careers) {
        const list = document.getElementById("careerList");

        careers.forEach((career, index) => {
        const option = document.createElement("section");

         option.innerHTML = `${career.Occupation}: $${career.Salary}`;
         option.setAttribute("id", `${index}`);
         option.addEventListener("click", () => {
            choice.Occupation = career.Occupation;
            choice.Salary = career.Salary;
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

