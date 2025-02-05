import axios from "axios";
import express from "express";

const app = express();
const PORT = 3000;

// Serve static files from the "public" directory
app.use(express.static(`public`));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");
app.get("/", (req, res) => {
  res.render("index.ejs", {
    id: "",
    name: "",
    imageURL: "",
    pokemonType: "",
    error: "",
  });
});

app.post("/search", async (req, res) => {
  try {
    //Ensures that requested body elements are numbers for ID and letters for Name
    const reqID = req.body.id ? req.body.id.trim().replace(/[^0-9]/g, "") : "";
    const reqName = req.body.name
      ? req.body.name
          .trim()
          .toLowerCase()
          .replace(/[^a-z]/g, "")
      : "";
    //Checks if ID and Name field are empty
    if (!reqID && !reqName) {
      let errorMessage = "Please enter a Pokémon name or Pokedex ID.";
    }

    //Adds form parameters into the api request
    const searchQuery = reqName || reqID;
    const response = await axios.get(
      `https://pokeapi.co/api/v2/pokemon/${searchQuery}`
    );
    //converts object into parsable EJS text
    const pokemonTypes = response.data.types.map((t) => t.type.name);
    res.render("index.ejs", {
      id: response.data.id,
      name: response.data.name,
      imageURL: response.data.sprites.front_default,
      pokemonType: pokemonTypes,
    });
  } catch (err) {
    // Custom error messages
    let errorMessage = "Something went wrong. Please try again.";

    if (err.response && err.response.status === 404) {
      errorMessage = "Pokémon not found. Please check the name or ID.";
    } else if (err.message.includes("Cannot read properties of undefined")) {
      errorMessage = "Pokémon data is incomplete or unavailable.";
    } else {
      errorMessage = err.message; // Fallback: Display the thrown error message
    }
    res.render("index.ejs", {
      id: "",
      name: "",
      imageURL: "",
      pokemonType: "",
      error: errorMessage,
    });
  }
});

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
