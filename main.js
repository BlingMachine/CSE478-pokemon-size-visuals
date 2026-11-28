// CSE 478 project: The True Size of a Pokémon

const svg = d3.select("#visualization")
    .append("svg")
    .attr("width", 600)
    .attr("height", 300);

svg.append("text")
    .attr("x", 300)
    .attr("y", 150)
    .attr("text-anchor", "middle")
    .attr("font-size", "24px")
    .text("D3 working");
3