const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const countries = require("../countries.json");

// Get all countries
router.get("/countries", (req, res) => {
  let sortedCountries = [...countries]; // Create a copy of the countries array

  // Sort the countries alphabetically if sort=true query parameter is present
  if (req.query.sort === "true") {
    sortedCountries.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Filter countries based on the visited query parameter
  if (req.query.visited === "true") {
    sortedCountries = sortedCountries.filter(
      (country) => country.visited === true
    );
  } else if (req.query.visited === "false") {
    sortedCountries = sortedCountries.filter(
      (country) => country.visited === false
    );
  }

  const limitedCountries = sortedCountries.slice(0, 5);

  // Render the countries.ejs template and pass the limitedCountries data to it
  res.render("countries.ejs", { countries: limitedCountries });
});

// Add a new country
router.post(
  "/countries/addCountry",
  [
    // Use validation middleware
    check("name").notEmpty().withMessage("Name field cannot be empty."),
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const newCountry = req.body;

    // Generate a unique ID for the new country
    const newCountryId = countries.length + 1;
    newCountry.id = newCountryId;

    // Check if the country already exists based on alpha 2 code or alpha 3 code
    const existingCountry = countries.find(
      (country) =>
        country.alpha2Code === newCountry.alpha2Code ||
        country.alpha3Code === newCountry.alpha3Code
    );

    if (existingCountry) {
      return res.status(400).json({ message: "Country already exists." });
    }

    // Add the new country to the list
    countries.push(newCountry);
    res.json(newCountry);
  }
);

// Get the country by country code
router.get("/countries/:code", (req, res) => {
  const countryCode = req.params.code.toUpperCase();

  // Find the country based on the country code
  const country = countries.find(
    (country) =>
      country.alpha2Code === countryCode || country.alpha3Code === countryCode
  );

  if (!country) {
    return res.status(404).json({ message: "Country not found." });
  } else {
    return res.json(country);
  }
});

// Edit the country by country code
router.put("/countries/edit/:code", (req, res) => {
  const { name, alpha2Code, alpha3Code, visited } = req.body;
  const countryCode = req.params.code.toUpperCase();

  const country = countries.find(
    (country) =>
      country.alpha2Code === countryCode || country.alpha3Code === countryCode
  );

  // Edit the country based on the country code
  if (!country) {
    return res.status(404).json({ message: "Country not found." });
  } else {
    country.name = name;
    country.alpha2Code = alpha2Code;
    country.alpha3Code = alpha3Code;
    country.visited = visited;

    return res.json({ message: "Country updated successfully.", country });
  }
});

// Edit the country by ID
router.put("/countries/editById/:id", (req, res) => {
  const { name, alpha2Code, alpha3Code, visited } = req.body;
  const countryId = req.params.id;

  const country = countries.find(
    (country) => country.id === parseInt(countryId)
  );

  // Edit the country based on the country ID
  if (!country) {
    return res.status(404).json({ message: "Country not found." });
  } else {
    country.name = name;
    country.alpha2Code = alpha2Code;
    country.alpha3Code = alpha3Code;
    country.visited = visited;

    return res.json({ message: "Country updated successfully.", country });
  }
});

// Delete the country by country code
router.delete("/countries/delete/:code", (req, res) => {
  const countryCode = req.params.code.toUpperCase();

  const countryIndex = countries.findIndex(
    (country) =>
      country.alpha2Code === countryCode || country.alpha3Code === countryCode
  );

  // Delete the country based on the country code
  if (countryIndex === -1) {
    return res.status(404).json({ message: "Country not found." });
  } else {
    countries.splice(countryIndex, 1);
    return res.json({ message: "Country deleted successfully." });
  }
});

module.exports = router;
