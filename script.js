d3.csv("data/glucose_lunch.csv").then(data => {
    console.log("Data loaded:", data);

    // Parse the data
    data.forEach(d => {
        d.time = parseFloat(d[Object.keys(d)[0]]); // Read the first column as time
        for (let key in d) {
            if (key !== "time") {
                d[key] = +d[key]; // Convert to integer
            }
        }
    });
    console.log("Data parsed:", data);

    // Convert time to string format
    data.forEach(d => {
        const hours = Math.floor(d.time);
        const minutes = Math.round((d.time - hours) * 100);
        if (d.time < 0) {
            d.timeString = `-00:${Math.abs(100-minutes)}`;
        } else {
            d.timeString = `0${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
        }
    });

    // Set the dimensions and margins of the graph
    const margin = {top: 20, right: 30, bottom: 50, left: 40}; // Increased bottom margin for rotated labels
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Append the SVG object to the body of the page
    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    console.log("SVG created");

    // Add X axis
    const x = d3.scalePoint()
        .domain(data.map(d => d.timeString))
        .range([0, width]);
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");
    console.log("X axis added");

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([60, 220])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));
    console.log("Y axis added");

    // Add vertical dashed line at 00:00
    const lunchTimeX = x("00:00");
    svg.append("line")
        .attr("x1", lunchTimeX)
        .attr("x2", lunchTimeX)
        .attr("y1", 0)
        .attr("y2", height)
        .attr("stroke", "black")
        .attr("stroke-dasharray", "4");
    svg.append("text")
        .attr("x", lunchTimeX)
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "black")
        .text("Lunch Time");
    console.log("Vertical line and label added");

    // Line generator
    const line = d3.line()
        .x(d => x(d.timeString))
        .y(d => y(d.value));

    // Draw the lines
    const patients = Object.keys(data[0]).filter(key => key !== Object.keys(data[0])[0]).slice(0, -1);
    patients.forEach((patient, i) => {
        const validData = data.filter(d => !isNaN(d[patient]));
        const pathData = validData.map(d => ({timeString: d.timeString, value: d[patient]}));
        svg.append("path")
            .datum(pathData)
            .attr("class", `line line-color-${i}`) // Add class for CSS styling
            .attr("d", line)
            .style("fill", "none"); // Ensure the path is not filled
    });
    console.log("Lines drawn");

    // Add a legend
    const legend = svg.selectAll(".legend")
        .data(patients)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(0,${i * 15})`); // Vertical spacing

        legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 12) // Smaller width
        .attr("height", 12) // Smaller height
        .attr("class", (d, i) => `legend-color-${i}`); // Add class for CSS styling

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 6)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .style("font-size", "10px") // Font size
        .text(d => d);
    console.log("Legend added");
});