const info_data = [
    { state: "✅ Normal", fasting: "70-99 mg/dL", beforeMeals: "70-99 mg/dL", afterMeals: "<140 mg/dL", heATC: "<5.7%" },
    { state: "❕Prediabetes", fasting: "100-125 mg/dL", beforeMeals: "100-125 mg/dL", afterMeals: "140-199 mg/dL", heATC: "5.7-6.4%" },
    { state: "❗️Diabetes", fasting: ">126 mg/dL", beforeMeals: ">126 mg/dL", afterMeals: "≥200 mg/dL", heATC: "≥6.5%" }
];

const columns = ["STATE", "FASTING", "BEFORE MEALS", "1-2 HOURS AFTER MEALS", "HBA1C"];

const table = d3.select("#info")
    .append("table");

// Append the header row
table.append("thead")
    .append("tr")
    .selectAll("th")
    .data(columns)
    .enter()
    .append("th")
    .text(d => d);

// Append the data rows
const rows = table.append("tbody")
    .selectAll("tr")
    .data(info_data)
    .enter()
    .append("tr");

// Append cells for each row
rows.selectAll("td")
    .data(d => [d.state, d.fasting, d.beforeMeals, d.afterMeals, d.heATC])
    .enter()
    .append("td")
    .text(d => d);



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
            d.timeString = `-00:${Math.abs(100 - minutes)}`;
        } else {
            d.timeString = `0${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
        }
    });

    // Set the dimensions and margins of the graph
    const margin = {top: 20, right: 40, bottom: 55, left: 50};
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Append the SVG object
    const svg = d3.select("#chart")
        .append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
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

    // X axis label
    svg.append("text")
    .attr("class", "axis-label")
    .attr("text-anchor", "end")
    .attr("x", 400)
    .attr("y", 375)
    .text("Time (HH:MM)");

    // Y axis
    const y = d3.scaleLinear()
        .domain([60, 220])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));
    console.log("Y axis added");

     // Y axis label
     svg.append("text")
     .attr("class", "axis-label")
     .attr("text-anchor", "end")
     .attr("transform", "rotate(-90)")
     .attr("y", -35)
     .attr("x", -65)
     .text("Glucose Concentration (mg/dL)");

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

        const focusCircle = svg.append("circle")
            .attr("class", `focus-circle-${i}`)
            .attr("r", 4)
            .style("fill", "black")
            .style("display", "none");

        // Draw the path
        svg.append("path")
            .datum(pathData)
            .attr("class", `line line-color-${i}`)
            .attr("d", line)
            .style("fill", "none")
            .style("stroke-width", "4px")
            .style("pointer-events", "stroke")
            .on("mousemove", function(event, d) {
                // d is pathData array
                const [mouseX] = d3.pointer(event, this);
          
                // 1) Find the closest data point in x
                let closestPoint = null;
                let minDist = Infinity;
                d.forEach(pt => {
                  const dist = Math.abs(x(pt.timeString) - mouseX);
                  if (dist < minDist) {
                    minDist = dist;
                    closestPoint = pt;
                  }
                });
          
                // 2) Show tooltip if we found a valid closest point
                if (closestPoint) {
                    if (vc_checked){
                        patients.forEach((patient, i) => {
                            if ( linesSelected.length === 0 || linesSelected.includes(i)){
                                const patientData = data.filter(d => !isNaN(d[patient]));
                                const pathData = patientData.map(d => ({
                                    timeString: d.timeString,
                                    value: d[patient],
                                    patient: patient
                                }));
                                const matchingPoint = pathData.find(pt => pt.timeString === closestPoint.timeString);
                                if (matchingPoint){
                                    svg.select(`.focus-circle-${i}`)
                                        .style("display",null)
                                        .attr("cx", x(matchingPoint.timeString))
                                        .attr("cy", y(matchingPoint.value));
                                }
                            }
                        });
                    } else { // V-compare mode is not checked
                        focusCircle
                            .style("display", null) // un-hide
                            .attr("cx", x(closestPoint.timeString))
                            .attr("cy", y(closestPoint.value))
                            // .raise();
                            ;
                        
                        // Set label based on the timeString value
                        const label = (closestPoint.timeString.charAt(0) === '-') ? "Time Before Lunch:" : "Time After Lunch:";
                        tooltip
                            .style("opacity", 1)
                            .html(`
                            <strong>${label}</strong> ${closestPoint.timeString}<br>
                            <strong>${closestPoint.patient} Glucose:</strong> ${closestPoint.value}
                            `)
                            .style("left", (event.pageX + 15) + "px")
                            .style("top", (event.pageY + 15) + "px");
                    }
                }
              })
              .on("mouseout", function() {
                // Hide tooltip when leaving the line
                if (vc_checked){
                    patients.forEach((patient, i) => {
                        svg.select(`.focus-circle-${i}`).style("display", "none");
                    });
                } else {
                    focusCircle.style("display", "none");
                }
                
                tooltip.style("opacity", 0);
              });
            // .on("mouseover", function(event, d) {
            //     d3.select(this).style("stroke-width", "4px"); // highlight line
            // })
            // .on("mouseout", function() {
            //     d3.select(this).style("stroke-width", "2px"); // reset
            //     tooltip.transition().duration(200).style("opacity", 0);
            // });

        // Draw the circles for each data point
        svg.selectAll(`.circle-${i}`)
            .data(pathData)
            .enter().append("circle")
            .attr("class", `circle circle-${i}`)
            .attr("cx", d => x(d.timeString))
            .attr("cy", d => y(d.value))
            .attr("r", 4)
            .style("fill", "transparent")
            .style("pointer-events", "all")
            .on("mouseover", function(event, d) {
                if (vc_checked){
                    const pointingTime = this.__data__.timeString;
                    const matchingPointsArray = [];

                    patients.forEach((patient, i) => {
                        if ( linesSelected.length === 0 || linesSelected.includes(i)){
                            const patientData = data.filter(d => !isNaN(d[patient]));
                            const pathData = patientData.map(d => ({
                                timeString: d.timeString,
                                value: d[patient],
                                patient: patient
                            }));
                            const matchingPoint = pathData.find(pt => pt.timeString === pointingTime);
                            if (matchingPoint){
                                svg.select(`.focus-circle-${i}`)
                                    .style("display",null)
                                    .attr("cx", x(matchingPoint.timeString))
                                    .attr("cy", y(matchingPoint.value));

                                    // update matching points array for later tooltip use
                                    matchingPointsArray.push(matchingPoint);
                            }
                        }
                    });

                    
                    // Vertical dashed line at selected time
                    const selectedTime = x(pointingTime);
                    svg.append("line")
                        .attr("class", "selectedTimeLine")
                        .attr("x1", selectedTime)
                        .attr("x2", selectedTime)
                        .attr("y1", 0)
                        .attr("y2", height)
                        .attr("stroke", "red")
                        .attr("stroke-dasharray", "4")
                        .transition().duration(200);

                    // create tooltip with dynamic label
                    tooltip.transition().duration(200).style("opacity", 1);
                    tooltip.html("");
                    const label = (this.__data__.timeString.charAt(0) === '-') ? "Time Before Lunch:" : "Time After Lunch:";
                    tooltip.append("div").html(`
                        <strong>${label}</strong> ${this.__data__.timeString}
                        `);
                    for (let point of matchingPointsArray.sort((a,b) => b.value - a.value)){
                        tooltip.append("div").html(`
                            <strong>${point.patient} Glucose:</strong> ${point.value}
                        `);
                    }

                    tooltip.style("left", (event.pageX + 15) + "px")
                            .style("top", (event.pageY + 15) + "px");

                } else {    // V-compare mode is not checked
                    d3.select(this).style("fill", "black"); // highlight point
                    const label = (d.timeString.charAt(0) === '-') ? "Time Before Lunch:" : "Time After Lunch:";
                    tooltip.transition().duration(200).style("opacity", 1);
                    tooltip.html(`
                        <strong>${label}</strong> ${d.timeString} <br>
                        <strong>${d.patient} Glucose:</strong> ${d.value}
                    `)
                    .style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY + 15) + "px");
                }
            })
            .on("mouseout", function() {
                if (vc_checked){
                    patients.forEach((patient, i) => {
                        svg.select(`.focus-circle-${i}`).style("display", "none");
                    });

                    svg.selectAll(".selectedTimeLine").remove();
                } else {
                    d3.select(this).style("fill", "transparent");
                }
                
                tooltip.transition().duration(200).style("opacity", 0);
            });
    });
    console.log("Lines and circles drawn");

    // Tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")

    // Legend
    const legend = svg.selectAll(".legend")
        .data(patients)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(0,${i * 15})`);

    legend.append("rect")
        .attr("x", width - 18)
        .attr("y", -7)
        .attr("width", 12)
        .attr("height", 12)
        .attr("class", (d, i) => `legend-color-${i}`);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", -2)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .style("font-size", "10px")
        .text(d => d);

    let checkedCount = 8; // Start with all checked

    // Add checkboxes in the legend
    legend.append("foreignObject")
        .attr("class", "lineSelect")
        .attr("x", width - 5)
        .attr("y", -10)
        .attr("width", 20)
        .attr("height", 20)
        .append("xhtml:input")
        .attr("type", "checkbox")
        .property("checked", true) // Initially all checked
        .on("change", function(event, d) {
            const selectedIndex = patients.indexOf(d);
            const allLines = svg.selectAll(".line");
            const allCircles = svg.selectAll(".circle");
            const isChecked = this.checked;

            // update lines selected
            if (linesSelected.includes(selectedIndex)){
                linesSelected.splice(linesSelected.indexOf(selectedIndex),1);
            } else {
                linesSelected.push(selectedIndex);
            }

            if (checkedCount === 8) {
                // Step 2: If all are checked, uncheck all first
                d3.selectAll(".lineSelect input").property("checked", false);
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

                    // Step 4: If count reaches 8 again, reset to all checked, 
                    if (checkedCount === 8) {
                        // d3.selectAll(".lineSelect input").property("checked", true);
                        // allLines.style("display", "block");
                        // allCircles.style("display", "block");
                        linesSelected = [];
                    }
                } else {
                    // Step 5: If only one checkbox is checked and it's unchecked, reset to all
                    if (checkedCount === 1) {
                        d3.selectAll(".lineSelect input").property("checked", true);
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

        let vc_checked = false;
        let linesSelected = [];
    
        const mode = svg.append("g")
                        .attr("class", "mode")
                        .attr("transform",`translate(-310,-10)`);
        mode.append("text")
            .attr("x", width - 30)
            .attr("y", 0)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .style("font-size", "12px")
            .text("V-compare");
    
        mode.append("foreignObject")
            .attr("class", "mode")
            .attr("x", width + -30)
            .attr("y", -10)
            .attr("width", 20)
            .attr("height", 20)
            .append("xhtml:input")
            .attr("type", "checkbox")
            .property("checked", false) // Initially not checked
            .on("change",function() {
                if (this.checked){
                    vc_checked = true;
                } else {
                    vc_checked = false;
                }
            });
    });
