// API endpoint and authorization
const EXPENSES_URL = ""; // Replace {database_id} with the actual database ID
const INCOME_URL = ""; // Replace {database_id} with the actual database ID

const fetchExpenseData = (startCursor = undefined, expenseData = []) => {
    const requestBody = {
        start_cursor: startCursor
    };

    return axios
        .post(EXPENSES_URL, requestBody)
        .then(response => {
            expenseData.push(...response.data.results);
            if (response.data.has_more) {
                const nextStartCursor = response.data.next_cursor;
                return fetchExpenseData(nextStartCursor, expenseData);
            }
            return expenseData;
        })
        .catch(error => {
            console.error('Error fetching expense data from Notion API:', error);
            return expenseData;
        });
}

const fetchIncomeData = (startCursor = undefined, expenseData = []) => {
    const requestBody = {
        start_cursor: startCursor
    };

    return axios
        .post(INCOME_URL, requestBody)
        .then(response => {
            expenseData.push(...response.data.results);
            if (response.data.has_more) {
                const nextStartCursor = response.data.next_cursor;
                return fetchIncomeData(nextStartCursor, expenseData);
            }
            return expenseData;
        })
        .catch(error => {
            console.error('Error fetching income data from Notion API:', error);
            return expenseData;
        });
}

const sortByDate = (a, b) => {
    const dateA = new Date(a.properties.date_added.date.start);
    const dateB = new Date(b.properties.date_added.date.start);
    return dateA - dateB;
}

// Helper function to group items by month
const groupByMonth = (items) => {
    const groupedData = {};
    items.forEach(item => {
        const date = new Date(item.properties.date_added.date.start);
        const month = `${date.getFullYear()}-${date.getMonth() + 1}`;
        if (groupedData[month]) {
            groupedData[month].push(item);
        } else {
            groupedData[month] = [item];
        }
    });
    return groupedData;
}

// Helper function to format month label
const formatMonthLabel = (month) => {
    const [year, monthNumber] = month.split('-');
    const date = new Date(year, monthNumber - 1);
    return date.toLocaleString('en-US', { year: 'numeric', month: 'long' });
}

// Fetch expense data from Notion API
Promise
    .all([fetchExpenseData(), fetchIncomeData()])
    .then(([expenseData, incomeData]) => {
        // Filter out items with empty price or date
        const filteredExpenseData = expenseData.filter((item) => item.properties.date_added.date != null && item.properties.date_added.date.start != null && item.properties.price_lira != null && item.properties.price_lira.number != null);
        const filteredIncomeData = incomeData.filter((item) => item.properties.date_added.date != null && item.properties.date_added.date.start != null && item.properties.price_lira != null && item.properties.price_lira.number != null);

        // Sort by date
        filteredExpenseData.sort(sortByDate);
        filteredIncomeData.sort(sortByDate);

        // Group expenses by month
        const groupedExpenseData = groupByMonth(filteredExpenseData);

        // Group expenses by month
        const groupedIncomeData = groupByMonth(filteredIncomeData);

        // Extracting labels (x-axis) and data (y-axis) from the grouped data
        const labels = Object.keys(groupedExpenseData);

        const expenseChartData = [];
        const incomeChartData = [];

        // Aligning expense and income datasets based on months
        for (let i = 0; i < labels.length; i++) {
            const month = labels[i];

            if (groupedExpenseData[month]) {
                expenseChartData.push(groupedExpenseData[month].reduce((sum, item) => sum + item.properties.price_lira.number, 0));
            } else {
                expenseChartData.push(0);
            }

            if (groupedIncomeData[month]) {
                incomeChartData.push(groupedIncomeData[month].reduce((sum, item) => sum + item.properties.price_lira.number, 0));
            } else {
                incomeChartData.push(0);
            }
        }

        // Convert month labels to human-readable format
        const humanReadableLabels = labels.map(formatMonthLabel);

        // Creating the bar chart
        const ctx = document
            .getElementById('budget')
            .getContext('2d');
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: humanReadableLabels,
                datasets: [
                    {
                        label: 'Expenses',
                        data: expenseChartData,
                        backgroundColor: 'rgba(244, 74, 1, 0.5)',
                        borderColor: 'rgba(244, 74, 1, 1)',
                        borderWidth: 1
                    }, {
                        label: 'Income',
                        data: incomeChartData,
                        backgroundColor: 'rgba(143, 0, 255, 0.5)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Month'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Price'
                        }
                    }
                }
            }
        });
    })
    .catch(error => {
        console.error('Error fetching expense data from Notion API:', error);
    });
