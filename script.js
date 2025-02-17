d3.csv("data/glucose_lunch.csv").then(data => {
    console.log("Data loaded:", data);
    // Parse the data
    data.forEach(d => {
        if (d.time) {
            d.time = d3.timeParse("%H:%M")(d.time.split(' ')[1]);
        }
        for (let key in d) {
            if (key !== "time") {
                d[key] = +d[key];
            }
        }
    });
    console.log("Data parsed:", data);

    // Set the dimensions and margins of the graph
    const margin = {top: 20, right: 30, bottom: 30, left: 40};
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
    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.time))
        .range([0, width]);
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));
    console.log("X axis added");

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d3.max(Object.values(d).filter(v => typeof v === 'number')))])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));
    console.log("Y axis added");

    // Color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Line generator
    const line = d3.line()
        .x(d => x(d.time))
        .y(d => y(d.value));

    // Draw the lines
    const patients = Object.keys(data[0]).filter(key => key !== "time");
    patients.forEach(patient => {
        const validData = data.filter(d => d.time && !isNaN(d[patient]));
        svg.append("path")
            .datum(validData.map(d => ({time: d.time, value: d[patient]})))
            .attr("class", "line")
            .attr("d", line)
            .style("stroke", color(patient));
    });
    console.log("Lines drawn");

    // Add a legend
    const legend = svg.selectAll(".legend")
        .data(patients)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(0,${i * 20})`);

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(d => d);
    console.log("Legend added");
});