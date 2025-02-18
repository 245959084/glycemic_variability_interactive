// d3.csv("data/glucose_lunch.csv").then(data => {
//     console.log("Data loaded:", data);

//     // Parse the data
//     data.forEach(d => {
//         d.time = parseFloat(d[Object.keys(d)[0]]); // Read the first column as time
//         for (let key in d) {
//             if (key !== "time") {
//                 d[key] = +d[key]; // Convert to integer
//             }
//         }
//     });
//     console.log("Data parsed:", data);

//     // Convert time to string format
//     data.forEach(d => {
//         const hours = Math.floor(d.time);
//         const minutes = Math.round((d.time - hours) * 100);
//         if (d.time < 0) {
//             d.timeString = `-00:${Math.abs(100-minutes)}`;
//         } else {
//             d.timeString = `0${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
//         }
//     });

//     // Set the dimensions and margins of the graph
//     const margin = {top: 20, right: 30, bottom: 50, left: 40}; // Increased bottom margin for rotated labels
//     const width = 800 - margin.left - margin.right;
//     const height = 400 - margin.top - margin.bottom;

//     // Append the SVG object to the body of the page
//     const svg = d3.select("#chart")
//         .append("svg")
//         .attr("width", width + margin.left + margin.right)
//         .attr("height", height + margin.top + margin.bottom)
//         .append("g")
//         .attr("transform", `translate(${margin.left},${margin.top})`);
//     console.log("SVG created");

//     // Add X axis
//     const x = d3.scalePoint()
//         .domain(data.map(d => d.timeString))
//         .range([0, width]);
//     svg.append("g")
//         .attr("transform", `translate(0,${height})`)
//         .call(d3.axisBottom(x))
//         .selectAll("text")
//         .attr("transform", "rotate(-45)")
//         .style("text-anchor", "end");
//     console.log("X axis added");

//     // Add Y axis
//     const y = d3.scaleLinear()
//         .domain([60, 220])
//         .range([height, 0]);
//     svg.append("g")
//         .call(d3.axisLeft(y));
//     console.log("Y axis added");

//     // Add vertical dashed line at 00:00
//     const lunchTimeX = x("00:00");
//     svg.append("line")
//         .attr("x1", lunchTimeX)
//         .attr("x2", lunchTimeX)
//         .attr("y1", 0)
//         .attr("y2", height)
//         .attr("stroke", "black")
//         .attr("stroke-dasharray", "4");
//     svg.append("text")
//         .attr("x", lunchTimeX)
//         .attr("y", -5)
//         .attr("text-anchor", "middle")
//         .style("font-size", "12px")
//         .style("fill", "black")
//         .text("Lunch Time");
//     console.log("Vertical line and label added");

//     // Line generator
//     const line = d3.line()
//         .x(d => x(d.timeString))
//         .y(d => y(d.value))
//         .curve(d3.curveMonotoneX); //more smooth

//     // Draw the lines
//     const patients = Object.keys(data[0]).filter(key => key !== Object.keys(data[0])[0]).slice(0, -1);
//     patients.forEach((patient, i) => {
//         const validData = data.filter(d => !isNaN(d[patient]));
//         const pathData = validData.map(d => ({timeString: d.timeString, value: d[patient], patient: patient}));
//         const path = svg.append("path")
//         .datum(pathData)
//         .attr("class", `line line-color-${i}`)
//         .attr("d", line)
//         .style("fill", "none")
//         .style("stroke-width", "2px")
//         .on("mouseover", function(event, d) {
//             d3.select(this).style("stroke-width", "4px"); // Highlight line
//         })
//         .on("mouseout", function() {
//             d3.select(this).style("stroke-width", "2px"); // Reset
//             tooltip.transition().duration(200).style("opacity", 0);
//         });
//         svg.selectAll(`.circle-${i}`)
//         .data(pathData)
//         .enter().append("circle")
//         .attr("class", `circle-${i}`)
//         .attr("cx", d => x(d.timeString))
//         .attr("cy", d => y(d.value))
//         .attr("r", 4)
//         .style("fill", "transparent")
//         .style("pointer-events", "all")
//         .on("mouseover", function(event, d) { // Add tooltip
//             d3.select(this).style("fill", "black"); // Highlight point
//             tooltip.transition().duration(200).style("opacity", 1);
//             tooltip.html(`
//                 <strong>Time After Lunch:</strong> ${d.timeString} <br>
//                 <strong>${d.patient} Glucose:</strong> ${d.value}
//             `)
//             .style("left", (event.pageX + 10) + "px")
//             .style("top", (event.pageY - 20) + "px");
//         })
//         .on("mouseout", function() {
//             d3.select(this).style("fill", "transparent");
//             tooltip.transition().duration(200).style("opacity", 0);
//         });
//     });
//     console.log("Lines drawn");

//     function interpolateGlucose(time, data, patient) {
//         for (let i = 0; i < data.length - 1; i++) {
//             let d1 = data[i], d2 = data[i + 1];
//             if (d1.timeString <= time && d2.timeString >= time) {
//                 let t1 = x(d1.timeString), t2 = x(d2.timeString);
//                 let g1 = d1[patient], g2 = d2[patient];
    
//                 // Linear interpolation formula
//                 let estimatedGlucose = g1 + (g2 - g1) * ((x(time) - t1) / (t2 - t1));
//                 return estimatedGlucose;
//             }
//         }
//         return null;
//     }

//     // Add a legend
//     const legend = svg.selectAll(".legend")
//         .data(patients)
//         .enter().append("g")
//         .attr("class", "legend")
//         .attr("transform", (d, i) => `translate(0,${i * 15})`); // Vertical spacing

//         legend.append("rect")
//         .attr("x", width - 18)
//         .attr("width", 12) // Smaller width
//         .attr("height", 12) // Smaller height
//         .attr("class", (d, i) => `legend-color-${i}`); // Add class for CSS styling

//     legend.append("text")
//         .attr("x", width - 24)
//         .attr("y", 6)
//         .attr("dy", ".35em")
//         .style("text-anchor", "end")
//         .style("font-size", "10px") // Font size
//         .text(d => d);
//     console.log("Legend added");

//     const tooltip = d3.select("body").append("div")
//     .attr("id", "tooltip")
//     .style("position", "absolute")
//     .style("opacity", 0)
//     .style("background", "white")
//     .style("border", "1px solid black")
//     .style("padding", "5px")
//     .style("font-size", "12px");

//     let checkedCount = 8; // Start with all checked

//     legend.append("foreignObject")
//         .attr("x", width - 0) // Adjust position
//         .attr("y", -5)
//         .attr("width", 20)
//         .attr("height", 20)
//         .append("xhtml:input")
//         .attr("type", "checkbox")
//         .property("checked", true) // Initially all checked
//         .on("change", function(event, d) {  
//             const selectedIndex = patients.indexOf(d);
//             const allLines = svg.selectAll(".line");
//             const isChecked = this.checked;

//             if (checkedCount === 8) {
//                 // Step 2: If all are checked, uncheck all first
//                 d3.selectAll("input[type='checkbox']").property("checked", false);
//                 allLines.style("display", "none");

//                 // Then, check only the selected one
//                 d3.select(this).property("checked", true);
//                 svg.select(`.line-color-${selectedIndex}`).style("display", "block");

//                 checkedCount = 1; // Reset count to 1
//             } else {
//                 if (isChecked) {
//                     // Step 3: Checking a new box (add one more line)
//                     svg.select(`.line-color-${selectedIndex}`).style("display", "block");
//                     checkedCount++;

//                     // Step 4: If count reaches 8 again, reset to all checked
//                     if (checkedCount === 8) {
//                         d3.selectAll("input[type='checkbox']").property("checked", true);
//                         allLines.style("display", "block");
//                     }
//                 } else {
//                     // Step 5: If only one checkbox is checked and it's unchecked, reset to all
//                     if (checkedCount === 1) {
//                         d3.selectAll("input[type='checkbox']").property("checked", true);
//                         allLines.style("display", "block");
//                         checkedCount = 8;
//                     } else {
//                         // Otherwise, just hide the unchecked line
//                         svg.select(`.line-color-${selectedIndex}`).style("display", "none");
//                         checkedCount--;
//                     }
//                 }
//             }
//         });
// });

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
            // If negative time, e.g., -0.20 -> "Time Before Lunch"
            d.timeString = `-00:${Math.abs(100-minutes)}`;
        } else {
            d.timeString = `0${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
        }
    });

    // Set the dimensions and margins of the graph
    const margin = {top: 20, right: 30, bottom: 50, left: 40};
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Append the SVG object
    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    console.log("SVG created");

    // X axis
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

    // Y axis
    const y = d3.scaleLinear()
        .domain([60, 220])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));
    console.log("Y axis added");

    // Vertical dashed line at 00:00 (Lunch Time)
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
        .y(d => y(d.value))
        .curve(d3.curveMonotoneX);

    // Identify the patient columns (everything but the first column/timeString)
    const patients = Object.keys(data[0]).filter(key => key !== Object.keys(data[0])[0]).slice(0, -1);

    // Draw the lines and circles
    patients.forEach((patient, i) => {
        const validData = data.filter(d => !isNaN(d[patient]));
        const pathData = validData.map(d => ({
            timeString: d.timeString,
            value: d[patient],
            patient: patient
        }));

        // Draw the path
        svg.append("path")
            .datum(pathData)
            .attr("class", `line line-color-${i}`)
            .attr("d", line)
            .style("fill", "none")
            .style("stroke-width", "2px")
            .on("mouseover", function(event, d) {
                d3.select(this).style("stroke-width", "4px"); // highlight line
            })
            .on("mouseout", function() {
                d3.select(this).style("stroke-width", "2px"); // reset
                tooltip.transition().duration(200).style("opacity", 0);
            });

        // Draw the circles for each data point
        svg.selectAll(`.circle-${i}`)
            .data(pathData)
            .enter().append("circle")
            .attr("class", `circle-${i}`)
            .attr("cx", d => x(d.timeString))
            .attr("cy", d => y(d.value))
            .attr("r", 4)
            .style("fill", "transparent")
            .style("pointer-events", "all")
            .on("mouseover", function(event, d) {
                d3.select(this).style("fill", "black"); // highlight point
                tooltip.transition().duration(200).style("opacity", 1);
                tooltip.html(`
                    <strong>Time After Lunch:</strong> ${d.timeString} <br>
                    <strong>${d.patient} Glucose:</strong> ${d.value}
                `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
            })
            .on("mouseout", function() {
                d3.select(this).style("fill", "transparent");
                tooltip.transition().duration(200).style("opacity", 0);
            });
    });
    console.log("Lines and circles drawn");

    // Tooltip
    const tooltip = d3.select("body").append("div")
        .attr("id", "tooltip")
        .style("position", "absolute")
        .style("opacity", 0)
        .style("background", "white")
        .style("border", "1px solid black")
        .style("padding", "5px")
        .style("font-size", "12px");

    // Legend
    const legend = svg.selectAll(".legend")
        .data(patients)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(0,${i * 15})`);

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 12)
        .attr("height", 12)
        .attr("class", (d, i) => `legend-color-${i}`);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 6)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .style("font-size", "10px")
        .text(d => d);

    let checkedCount = 8; // Start with all checked

    // Add checkboxes in the legend
    legend.append("foreignObject")
        .attr("x", width - 0)
        .attr("y", -5)
        .attr("width", 20)
        .attr("height", 20)
        .append("xhtml:input")
        .attr("type", "checkbox")
        .property("checked", true) // Initially all checked
        .on("change", function(event, d) {
            const selectedIndex = patients.indexOf(d);
            const allLines = svg.selectAll(".line");
            const allCircles = svg.selectAll("circle");
            const isChecked = this.checked;

            if (checkedCount === 8) {
                // Step 2: If all are checked, uncheck all first
                d3.selectAll("input[type='checkbox']").property("checked", false);
                allLines.style("display", "none");
                allCircles.style("display", "none");

                // Then, check only the selected one
                d3.select(this).property("checked", true);
                svg.selectAll(`.line-color-${selectedIndex}, .circle-${selectedIndex}`)
                   .style("display", "block");

                checkedCount = 1; // Reset count to 1
            } else {
                if (isChecked) {
                    // Step 3: Checking a new box (add one more line + circles)
                    svg.selectAll(`.line-color-${selectedIndex}, .circle-${selectedIndex}`)
                       .style("display", "block");
                    checkedCount++;

                    // Step 4: If count reaches 8 again, reset to all checked
                    if (checkedCount === 8) {
                        d3.selectAll("input[type='checkbox']").property("checked", true);
                        allLines.style("display", "block");
                        allCircles.style("display", "block");
                    }
                } else {
                    // Step 5: If only one checkbox is checked and it's unchecked, reset to all
                    if (checkedCount === 1) {
                        d3.selectAll("input[type='checkbox']").property("checked", true);
                        allLines.style("display", "block");
                        allCircles.style("display", "block");
                        checkedCount = 8;
                    } else {
                        // Otherwise, just hide the unchecked line + circles
                        svg.selectAll(`.line-color-${selectedIndex}, .circle-${selectedIndex}`)
                           .style("display", "none");
                        checkedCount--;
                    }
                }
            }
        });
  });
