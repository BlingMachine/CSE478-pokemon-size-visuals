// CSE 478 - Pokemon Size Comparison

const comparison = d3.select("#comparison");
const pokemonSelect = d3.select("#pokemonSelect");

// load pokemon dataset
d3.csv("../scatterplot/metadata_pokemon.csv").then(data => {

    // convert csv values
    const pokemon = data.map(d => ({
        id: +d.id,
        name: d.name,
        height: +d.height / 10,
        weight: +d.weight / 10
    })).filter(d => d.id > 0 && d.height > 0);

    // sort pokemon by pokedex number
    pokemon.sort((a, b) => a.id - b.id);

    // add pokemon to dropdown
    pokemonSelect.selectAll("option")
        .data(pokemon)
        .enter()
        .append("option")
        .attr("value", d => d.id)
        .text(d => `#${d.id} ${d.name}`);

    // update comparison when selection changes
    pokemonSelect.on("change", function() {
        const selected = pokemon.find(d => d.id === +this.value);
        if (selected) {
            displayComparison(selected);
        }
    });

    // display pikachu by default
    const pikachu = pokemon.find(d => d.id === 25);
    const initialPokemon = pikachu || pokemon[0];

    if (initialPokemon) {
        pokemonSelect.property("value", initialPokemon.id);
        displayComparison(initialPokemon);
    }

}).catch(error => {
    console.error("Error loading Pokemon dataset:", error);
});

function displayComparison(pokemon) {


    const humanHeight = 1.75;

    // adjust scale to fit the tallest object
    const maxHeight = 450;
    const scale = Math.min(200, maxHeight / Math.max(pokemon.height, humanHeight));

    // clear previous comparison
    comparison.selectAll("*").remove();

    // pokemon image
    const pokemonDiv = comparison.append("div")
        .attr("class", "item");

    // Pokemon PNG!
    const imageUrl = `images/${pokemon.id}.png`;


    pokemonDiv.append("img")
        .attr("src", imageUrl)
        .attr("alt", pokemon.name)
        .style("height", (pokemon.height * scale) + "px")
        .on("error", function() {
            d3.select(this).style("display", "none");
        });

    pokemonDiv.append("p")
        .text(`${pokemon.name}: ${pokemon.height} m`);


    const humanDiv = comparison.append("div")
        .attr("class", "item");

    const humanSvg = humanDiv.append("svg")
        .attr("width", 120)
        .attr("height", humanHeight * scale)
        .attr("viewBox", "0 0 120 350");

    humanSvg.append("circle")
        .attr("cx", 60)
        .attr("cy", 30)
        .attr("r", 25)
        .attr("fill", "gray");

    humanSvg.append("rect")
        .attr("x", 42)
        .attr("y", 60)
        .attr("width", 36)
        .attr("height", 150)
        .attr("fill", "gray");

    humanSvg.append("rect")
        .attr("x", 42)
        .attr("y", 210)
        .attr("width", 15)
        .attr("height", 140)
        .attr("fill", "gray");

    humanSvg.append("rect")
        .attr("x", 63)
        .attr("y", 210)
        .attr("width", 15)
        .attr("height", 140)
        .attr("fill", "gray");

    humanDiv.append("p")
        .text(`Human: ${humanHeight} m`);
}
