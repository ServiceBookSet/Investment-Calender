// === AUTHENTICATION LOGIC ===

// Check if user is logged in on page load
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const username = sessionStorage.getItem('username');
    
    if (isLoggedIn === 'true' && username) {
        showMainApp(username);
    } else {
        showLoginPage();
    }
}

function showLoginPage() {
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
}

function showMainApp(username) {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    document.getElementById('displayUsername').textContent = username;
}

function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorEl = document.getElementById('loginError');
    
    // Validate credentials
    if (!username || !password) {
        errorEl.textContent = 'Username and password are required.';
        errorEl.style.display = 'block';
        return;
    }
    
    // Check against correct credentials
    if (username === 'Nitin' && password === 'Invest@310') {
        errorEl.style.display = 'none';
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('username', username);
        
        // Clear form
        document.getElementById('loginForm').reset();
        
        // Show main app
        showMainApp(username);
    } else {
        errorEl.textContent = 'Invalid username or password.';
        errorEl.style.display = 'block';
    }
}

function handleLogout() {
    const confirmLogout = confirm('Are you sure you want to logout?');
    if (confirmLogout) {
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('username');
        showLoginPage();
        document.getElementById('loginForm').reset();
    }
}

// === ORIGINAL APPLICATION LOGIC ===

// Remove these initial declarations
// const calendarGrid = document.getElementById('calendar-grid');
// const monthYearDisplay = document.getElementById('monthYear');
// const prevMonthBtn = document.getElementById('prevMonth');
// const nextMonthBtn = document.getElementById('nextMonth');
// const currentInvestmentSpan = document.getElementById('currentInvestment');
// const marketStatusSpan = document.getElementById('marketStatus');
// const resetDataBtn = document.getElementById('resetDataBtn');
// const exportBtn = document.getElementById('exportBtn');

// Dialog elements
// const marketStatusDialog = document.getElementById('marketStatusDialog');
// const dialogDate = document.getElementById('dialogDate');
// const marketUpBtn = document.getElementById('marketUpBtn');
// const marketFallBtn = document.getElementById('marketFallBtn');

let currentDate = new Date();
let currentInvestmentAmount = 0;
let consecutiveMarketUpDays = 0;
let marketStatusData = {}; // New object to store market status for each day
let selectedDayDiv = null; // To store the dayDiv that was clicked
let selectedIsMarketOpen = false; // To store if the selected day is market open
let investmentChart = null;

// Function to save data to localStorage
function saveInvestmentData() {
    localStorage.setItem('marketStatusData', JSON.stringify(marketStatusData));
    localStorage.setItem('currentInvestmentAmount', currentInvestmentAmount);
    localStorage.setItem('consecutiveMarketUpDays', consecutiveMarketUpDays);
}

// Function to load data from localStorage
function loadInvestmentData() {
    const storedMarketStatusData = localStorage.getItem('marketStatusData');
    const storedInvestmentAmount = localStorage.getItem('currentInvestmentAmount');
    const storedConsecutiveDays = localStorage.getItem('consecutiveMarketUpDays');

    if (storedMarketStatusData) {
        marketStatusData = JSON.parse(storedMarketStatusData);
    }
    if (storedInvestmentAmount) {
        currentInvestmentAmount = parseFloat(storedInvestmentAmount);
    }
    if (storedConsecutiveDays) {
        consecutiveMarketUpDays = parseInt(storedConsecutiveDays);
    }
    // currentInvestmentSpan.textContent = currentInvestmentAmount; // This will be set after DOMContentLoaded
}

// Function to reset all data
function resetData() {
    localStorage.clear(); // Clear all data from localStorage
    marketStatusData = {}; // Reset in-memory data
    currentInvestmentAmount = 0;
    consecutiveMarketUpDays = 0;
    currentDate = new Date(); // Reset current date to today
    renderCalendar(); // Re-render calendar to reflect reset state
    // currentInvestmentSpan.textContent = currentInvestmentAmount; // Ensure this is updated after elements are defined
    // marketStatusSpan.textContent = 'N/A'; // Ensure this is updated after elements are defined
}

// Declare these variables globally but assign them inside DOMContentLoaded
let calendarGrid, monthYearDisplay, prevMonthBtn, nextMonthBtn, currentInvestmentSpan, marketStatusSpan, resetDataBtn, marketStatusDialog, dialogDate, marketUpBtn, marketFallBtn;

function renderCalendar() {
    console.log('renderCalendar function called'); // Debugging line
    try {
        if (!calendarGrid || !monthYearDisplay || !currentInvestmentSpan || !marketStatusSpan) {
            console.error('DOM elements not yet available for renderCalendar');
            return; // Exit if elements are not ready
        }

        calendarGrid.innerHTML = '';
        monthYearDisplay.textContent = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();
        const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday, etc.

        // Add day names
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayNames.forEach(day => {
            const dayNameDiv = document.createElement('div');
            dayNameDiv.classList.add('day-name');
            dayNameDiv.textContent = day;
            calendarGrid.appendChild(dayNameDiv);
        });

        // Add empty divs for days before the first day of the month
        for (let i = 0; i < firstDayOfWeek; i++) {
            const emptyDiv = document.createElement('div');
            calendarGrid.appendChild(emptyDiv);
        }

        // Add days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('calendar-day', 'current-month');
            dayDiv.textContent = i;
            const fullDate = new Date(year, month, i);
            const dateString = fullDate.toISOString().slice(0, 10); // YYYY-MM-DD format
            dayDiv.dataset.date = dateString;

            const isMarketOpen = (fullDate.getDay() !== 0 && fullDate.getDay() !== 6); // Not weekend

            if (isMarketOpen) {
                const status = marketStatusData[dateString];
                if (status === 'fall') {
                    dayDiv.classList.add('market-fall');
                    dayDiv.title = 'Market fell - Invest!';
                } else if (status === 'up') {
                    dayDiv.classList.add('market-up');
                    dayDiv.title = 'Market up - Accumulate!';
                } else {
                    dayDiv.title = 'Click to set market status';
                }
            } else {
                dayDiv.title = 'Market closed';
            }

            dayDiv.addEventListener('click', () => handleDayClick(dayDiv, isMarketOpen));
            calendarGrid.appendChild(dayDiv);
        }
        currentInvestmentSpan.textContent = currentInvestmentAmount;
        console.log('Calendar rendered successfully'); // Debugging line
    } catch (error) {
        console.error('Error rendering calendar:', error); // Error logging
    }
}

function showMarketStatusDialog(date, dayDiv, isMarketOpen) {
    if (!dialogDate || !marketStatusDialog) {
        console.error('Dialog elements not yet available for showMarketStatusDialog');
        return; // Exit if elements are not ready
    }
    dialogDate.textContent = date;
    marketStatusDialog.classList.add('visible');
    selectedDayDiv = dayDiv;
    selectedIsMarketOpen = isMarketOpen;
}

function hideMarketStatusDialog() {
    if (!marketStatusDialog) {
        console.error('Dialog elements not yet available for hideMarketStatusDialog');
        return; // Exit if elements are not ready
    }
    marketStatusDialog.classList.remove('visible');
    selectedDayDiv = null;
    selectedIsMarketOpen = false;
}

function handleDayClick(dayDiv, isMarketOpen) {
    // Remove previous selection
    const previouslySelected = document.querySelector('.calendar-day.selected');
    if (previouslySelected) {
        previouslySelected.classList.remove('selected');
    }
    dayDiv.classList.add('selected');

    const dateString = dayDiv.dataset.date;

    if (isMarketOpen) {
        let marketFalls = marketStatusData[dateString] === 'fall';
        let marketUp = marketStatusData[dateString] === 'up';

        if (!marketFalls && !marketUp) {
            showMarketStatusDialog(dateString, dayDiv, isMarketOpen);
        } else {
            // If status is already set, apply investment logic directly
            applyInvestmentLogic(dateString, marketFalls, marketUp);
        }
    } else {
        if (marketStatusSpan) {
            marketStatusSpan.textContent = 'Market Closed - No action.';
        }
        consecutiveMarketUpDays = 0; // Reset on closed days
    }
    if (currentInvestmentSpan) {
        currentInvestmentSpan.textContent = currentInvestmentAmount;
    }
    saveInvestmentData(); // Save data after any investment logic change
}

function applyInvestmentLogic(dateString, marketFalls, marketUp) {
    if (marketFalls) {
        const investmentAmount = 1000 + (consecutiveMarketUpDays * 1000);
        currentInvestmentAmount += investmentAmount;
        consecutiveMarketUpDays = 0; // Reset consecutive up days
        if (marketStatusSpan) {
            marketStatusSpan.textContent = 'Market Fell - Invested ' + investmentAmount;
        }
    } else if (marketUp) {
        consecutiveMarketUpDays++;
        if (marketStatusSpan) {
            marketStatusSpan.textContent = 'Market Up - Accumulating for next fall. Current accumulated: ' + (consecutiveMarketUpDays * 1000);
        }
    }
    saveInvestmentData();
    renderCalendar();
    updateInvestmentChart(); // Update chart after investment logic
    if (currentInvestmentSpan) {
        currentInvestmentSpan.textContent = currentInvestmentAmount;
    }
}

// Wrap all event listeners and initial calls in DOMContentLoaded
function exportToExcel() {
    const data = [['Date', 'Market Status', 'Investment']];
    for (const date in marketStatusData) {
        data.push([date, marketStatusData[date], '']);
    }
    data.push(['', 'Total Investment', currentInvestmentAmount]);

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Investment Data');
    XLSX.writeFile(workbook, 'investment_data.xlsx');
}

function updateInvestmentChart() {
    const chartCanvas = document.getElementById('investmentChart');
    if (!chartCanvas) return;

    // Prepare data for chart
    const dates = [];
    const investments = [];
    let cumulativeInvestment = 0;

    // Sort dates chronologically
    const sortedDates = Object.keys(marketStatusData).sort();
    
    sortedDates.forEach(date => {
        const status = marketStatusData[date];
        if (status === 'fall') {
            // Calculate the investment amount for this fall based on consecutive up days
            // We need to count consecutive up days before this date
            let consecutiveUpDays = 0;
            let tempDate = new Date(date);
            tempDate.setDate(tempDate.getDate() - 1);
            
            // Count backwards to find consecutive up days
            while (marketStatusData[tempDate.toISOString().slice(0, 10)] === 'up') {
                consecutiveUpDays++;
                tempDate.setDate(tempDate.getDate() - 1);
            }
            
            cumulativeInvestment += 1000 + (consecutiveUpDays * 1000);
        }
        dates.push(date);
        investments.push(cumulativeInvestment);
    });

    // Always add current date with current investment amount
    const today = new Date().toISOString().slice(0, 10);
    if (dates.length === 0 || dates[dates.length - 1] !== today) {
        dates.push(today);
        investments.push(currentInvestmentAmount);
    } else {
        // If today is already the last date, update it with current amount
        investments[investments.length - 1] = currentInvestmentAmount;
    }

    const ctx = chartCanvas.getContext('2d');
    
    // Destroy existing chart if it exists
    if (investmentChart) {
        investmentChart.destroy();
    }

    investmentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Investment Amount',
                data: investments,
                borderColor: '#007bff',
                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Investment Growth Over Time'
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Amount ($)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication first
    checkAuth();
    
    // Assign elements after DOM is loaded
    calendarGrid = document.getElementById('calendar-grid');
    monthYearDisplay = document.getElementById('monthYear');
    prevMonthBtn = document.getElementById('prevMonth');
    nextMonthBtn = document.getElementById('nextMonth');
    currentInvestmentSpan = document.getElementById('currentInvestment');
    marketStatusSpan = document.getElementById('marketStatus');
    resetDataBtn = document.getElementById('resetDataBtn');
    exportBtn = document.getElementById('exportBtn');

    // Dialog elements
    marketStatusDialog = document.getElementById('marketStatusDialog');
    dialogDate = document.getElementById('dialogDate');
    marketUpBtn = document.getElementById('marketUpBtn');
    marketFallBtn = document.getElementById('marketFallBtn');

    // Login/Logout event listeners
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Event listeners for prev/next month buttons
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // Event listener for reset button
    resetDataBtn.addEventListener('click', resetData);

    // Event listener for export button
    exportBtn.addEventListener('click', exportToExcel);

    // Event listeners for dialog buttons
    marketUpBtn.addEventListener('click', () => {
        if (selectedDayDiv) {
            const dateString = selectedDayDiv.dataset.date;
            marketStatusData[dateString] = 'up';
            applyInvestmentLogic(dateString, false, true);
            hideMarketStatusDialog();
        }
    });

    marketFallBtn.addEventListener('click', () => {
        if (selectedDayDiv) {
            const dateString = selectedDayDiv.dataset.date;
            marketStatusData[dateString] = 'fall';
            applyInvestmentLogic(dateString, true, false);
            hideMarketStatusDialog();
        }
    });

    /* JSON Export / Import for full data portability */
    function exportAppDataToJSON() {
        const exportObj = {
            exportedAt: new Date().toISOString(),
            origin: location.href,
            userAgent: navigator.userAgent,
            localStorage: {}
        };
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            exportObj.localStorage[key] = localStorage.getItem(key);
        }
        const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const filename = `investment-data-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    function importAppDataFromFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const parsed = JSON.parse(e.target.result);
                if (!parsed || typeof parsed.localStorage !== 'object') {
                    alert('Selected file is not a valid backup JSON.');
                    return;
                }
                const overwrite = confirm('Overwrite existing keys from backup? OK = overwrite existing keys, Cancel = keep existing keys (merge).');
                const clearAll = overwrite ? confirm('Also clear all existing localStorage before import? OK = clear all, Cancel = do not clear.') : false;
                if (clearAll) localStorage.clear();
                Object.entries(parsed.localStorage).forEach(([k, v]) => {
                    if (overwrite) {
                        localStorage.setItem(k, v);
                    } else {
                        if (localStorage.getItem(k) === null) {
                            localStorage.setItem(k, v);
                        }
                    }
                });
                alert('Import complete. The app will reload to apply changes.');
                // Try to call an in-app reload handler if available, otherwise reload the page
                if (typeof loadAppData === 'function') {
                    try { loadAppData(); } catch (_) { location.reload(); }
                } else {
                    location.reload();
                }
            } catch (err) {
                alert('Failed to parse JSON: ' + (err && err.message ? err.message : String(err)));
            }
        };
        reader.readAsText(file);
    }

    const exportJsonBtn = document.getElementById('exportJsonBtn');
    const importJsonBtn = document.getElementById('importJsonBtn');
    const importJsonInput = document.getElementById('importJsonInput');

    if (exportJsonBtn) {
        exportJsonBtn.addEventListener('click', () => {
            exportAppDataToJSON();
        });
    }

    if (importJsonBtn && importJsonInput) {
        importJsonBtn.addEventListener('click', () => importJsonInput.click());
        importJsonInput.addEventListener('change', (ev) => {
            const file = ev.target.files && ev.target.files[0];
            if (!file) return;
            const proceed = confirm(`Import data from "${file.name}"?`);
            if (!proceed) {
                importJsonInput.value = '';
                return;
            }
            importAppDataFromFile(file);
            importJsonInput.value = '';
        });
    }

    // Initial load
    loadInvestmentData();
    renderCalendar();
    updateInvestmentChart(); // Initialize chart on load
});
