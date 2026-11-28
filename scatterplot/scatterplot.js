const margin = { top: 24, right: 28, bottom: 56, left: 68 };
const width = 1040 - margin.left - margin.right;
const height = 560 - margin.top - margin.bottom;

const defaultColor = "#475569";
const typePalette = {
  Normal: "#A8A77A",
  Fire: "#EE8130",
  Water: "#6390F0",
  Electric: "#F7D02C",
  Grass: "#7AC74C",
  Ice: "#96D9D6",
  Fighting: "#C22E28",
  Poison: "#A33EA1",
  Ground: "#E2BF65",
  Flying: "#A98FF3",
  Psychic: "#F95587",
  Bug: "#A6B91A",
  Rock: "#B6A136",
  Ghost: "#735797",
  Dragon: "#6F35FC",
  Dark: "#705746",
  Steel: "#B7B7CE",
  Fairy: "#D685AD"
};

let highlightByType = false;
const highlightedTypes = new Set();

const errorBanner = document.getElementById("error-banner");

function showError(message) {
  errorBanner.textContent = message;
  errorBanner.style.display = "block";
}

const svg = d3
  .select("#chart")
  .append("svg")
  .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const xGridGroup = svg.append("g").attr("class", "grid");
const yGridGroup = svg.append("g").attr("class", "grid");
const xAxisGroup = svg.append("g").attr("transform", `translate(0,${height})`);
const yAxisGroup = svg.append("g");
const pointsGroup = svg.append("g").attr("class", "points");

svg
  .append("text")
  .attr("class", "axis-label")
  .attr("x", width / 2)
  .attr("y", height + 42)
  .attr("text-anchor", "middle")
  .text("Weight (kg)");

svg
  .append("text")
  .attr("class", "axis-label")
  .attr("transform", "rotate(-90)")
  .attr("x", -height / 2)
  .attr("y", -48)
  .attr("text-anchor", "middle")
  .text("Height (m)");

const tooltip = d3.select("#tooltip");
const typeControlsEl = d3.select("#type-controls");
const typeTogglesGridEl = d3.select("#type-toggles-grid");
const toggleEl = document.getElementById("typeToggle");
const selectAllBtn = document.getElementById("selectAllTypesBtn");
const clearAllBtn = document.getElementById("clearAllTypesBtn");

function getTypeColor(type) {
  return typePalette[type] || "#3b82f6";
}

function isTypeHighlighted(type) {
  if (!highlightByType) return false;
  if (highlightedTypes.size === 0) return true;
  return highlightedTypes.has(type);
}

function getBaseRadius(d) {
  if (highlightByType && highlightedTypes.size > 0 && highlightedTypes.has(d.type_1)) {
    return 6;
  }
  return 4.5;
}

function getBaseOpacity(d) {
  if (!highlightByType) return 0.72;
  if (highlightedTypes.size === 0) return 0.85;
  return highlightedTypes.has(d.type_1) ? 0.95 : 0.1;
}

d3.csv("metadata_pokemon.csv", (d) => {
  const rawWeightHg = +d.weight;
  const rawHeightDm = +d.height;
  if (!Number.isFinite(rawWeightHg) || !Number.isFinite(rawHeightDm) || rawWeightHg <= 0 || rawHeightDm <= 0) {
    return null;
  }
  return {
    name: d.name,
    id: +d.id,
    heightM: rawHeightDm / 10,
    weightKg: rawWeightHg / 10,
    type_1: d.type_1 ? d.type_1.trim() : "Unknown",
    type_2: d.type_2 && d.type_2.trim() !== "" ? d.type_2.trim() : null
  };
})
  .then((data) => {
    if (!data || data.length === 0) {
      showError("No valid rows found in metadata_pokemon.csv.");
      return;
    }

    const xScale = d3
      .scaleLog()
      .domain([d3.min(data, (d) => d.weightKg), d3.max(data, (d) => d.weightKg)])
      .range([0, width])
      .nice();

    const yScale = d3
      .scaleLog()
      .domain([d3.min(data, (d) => d.heightM), d3.max(data, (d) => d.heightM)])
      .range([height, 0])
      .nice();

    xAxisGroup.call(d3.axisBottom(xScale).ticks(6, "~g"));
    yAxisGroup.call(d3.axisLeft(yScale).ticks(6, "~g"));

    xGridGroup
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(6).tickSize(-height).tickFormat(""));

    yGridGroup.call(d3.axisLeft(yScale).ticks(6).tickSize(-width).tickFormat(""));

    const circles = pointsGroup
      .selectAll("circle")
      .data(data, (d) => `${d.id}-${d.name}`)
      .join("circle")
      .attr("cx", (d) => xScale(d.weightKg))
      .attr("cy", (d) => yScale(d.heightM))
      .attr("r", (d) => getBaseRadius(d))
      .attr("fill", defaultColor)
      .attr("fill-opacity", (d) => getBaseOpacity(d))
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 0.7)
      .on("mouseenter", function (event, d) {
        d3.select(this)
          .raise()
          .interrupt()
          .attr("r", 7.5)
          .attr("fill-opacity", 1)
          .attr("stroke", "#0f172a")
          .attr("stroke-width", 1.5);

        const typesLabel = d.type_2 ? `${d.type_1} / ${d.type_2}` : d.type_1;
        tooltip
          .style("opacity", 1)
          .html(
            `<strong>#${d.id} ${d.name}</strong>` +
              `Type: ${typesLabel}<br/>` +
              `Height: ${d.heightM.toFixed(1)} m<br/>` +
              `Weight: ${d.weightKg.toFixed(1)} kg`
          );
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", `${event.clientX + 14}px`)
          .style("top", `${event.clientY - 12}px`);
      })
      .on("mouseleave", function (event, d) {
        d3.select(this)
          .interrupt()
          .attr("r", getBaseRadius(d))
          .attr("fill-opacity", getBaseOpacity(d))
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 0.7);
        tooltip.style("opacity", 0);
      });

    const uniqueTypes = Array.from(new Set(data.map((d) => d.type_1))).sort();

    const cards = typeTogglesGridEl
      .selectAll("label")
      .data(uniqueTypes)
      .join("label")
      .attr("class", "type-toggle-card active");

    const typeLabelSpan = cards.append("span").attr("class", "type-label");

    typeLabelSpan
      .append("span")
      .attr("class", "type-swatch")
      .style("background-color", (d) => getTypeColor(d));

    typeLabelSpan.append("span").text((d) => d);

    const switchWrapper = cards.append("span").attr("class", "switch small");

    const typeInputs = switchWrapper
      .append("input")
      .attr("type", "checkbox")
      .attr("aria-label", (d) => `Highlight ${d} type`)
      .on("change", function (event, type) {
        if (event.target.checked) {
          highlightedTypes.add(type);
        } else {
          highlightedTypes.delete(type);
        }
        syncTypeToggleUI();
        updatePointStyles();
      });

    switchWrapper.append("span").attr("class", "slider");

    function syncTypeToggleUI() {
      typeInputs.property("checked", (d) => highlightedTypes.has(d));
      cards
        .classed("active", (d) => highlightedTypes.size === 0 || highlightedTypes.has(d))
        .classed("inactive", (d) => highlightedTypes.size > 0 && !highlightedTypes.has(d));
    }

    function updatePointStyles() {
      circles
        .interrupt()
        .transition()
        .duration(200)
        .attr("fill", (d) => (isTypeHighlighted(d.type_1) ? getTypeColor(d.type_1) : defaultColor))
        .attr("fill-opacity", (d) => getBaseOpacity(d))
        .attr("r", (d) => getBaseRadius(d));
    }

    selectAllBtn.addEventListener("click", () => {
      highlightedTypes.clear();
      uniqueTypes.forEach((t) => highlightedTypes.add(t));
      syncTypeToggleUI();
      updatePointStyles();
    });

    clearAllBtn.addEventListener("click", () => {
      highlightedTypes.clear();
      syncTypeToggleUI();
      updatePointStyles();
    });

    toggleEl.addEventListener("change", (e) => {
      highlightByType = e.target.checked;
      if (!highlightByType) {
        highlightedTypes.clear();
      }
      typeControlsEl.classed("visible", highlightByType);
      syncTypeToggleUI();
      updatePointStyles();
    });
  })
  .catch((err) => {
    console.error("Failed to load metadata_pokemon.csv:", err);
    showError(
      'Could not load "metadata_pokemon.csv". Make sure you open scatterplot.html through a local web server (e.g., "python3 -m http.server") rather than opening scatterplot.html directly as a file.'
    );
  });