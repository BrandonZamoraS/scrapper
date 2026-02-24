const axios = require("axios");

const API_KEY = "yxxfYRvpA91cDVUWMtGWy6PC";
// Use a sample product image URL from Supabase or a public one
const IMAGE_URL = process.argv[2] || "https://ctompzbscbugsiswsmlz.supabase.co/storage/v1/object/public/product-images/test.png";

async function main() {
  console.log("Calling SearchApi.io Google Lens with:", IMAGE_URL, "\n");

  const response = await axios.get("https://www.searchapi.io/api/v1/search", {
    params: {
      engine: "google_lens",
      url: IMAGE_URL,
      api_key: API_KEY,
    },
    timeout: 30000,
  });

  const data = response.data;

  // Log all top-level keys
  console.log("Top-level keys:", Object.keys(data), "\n");

  // Log first 2 visual matches in full
  if (data.visual_matches?.length) {
    console.log(`=== visual_matches (${data.visual_matches.length} total) ===`);
    for (const m of data.visual_matches.slice(0, 3)) {
      console.log(JSON.stringify(m, null, 2));
      console.log("---");
    }
  }

  // Log first 2 shopping results
  if (data.shopping_results?.length) {
    console.log(`\n=== shopping_results (${data.shopping_results.length} total) ===`);
    for (const s of data.shopping_results.slice(0, 3)) {
      console.log(JSON.stringify(s, null, 2));
      console.log("---");
    }
  }

  // Check for other price-related keys
  const allKeys = Object.keys(data);
  for (const key of allKeys) {
    if (key !== "visual_matches" && key !== "shopping_results" && key !== "search_metadata" && key !== "search_parameters") {
      const val = data[key];
      if (Array.isArray(val) && val.length > 0) {
        console.log(`\n=== ${key} (${val.length} items) ===`);
        console.log(JSON.stringify(val.slice(0, 2), null, 2));
      } else if (typeof val === "object" && val !== null) {
        console.log(`\n=== ${key} (object) ===`);
        console.log(JSON.stringify(val, null, 2));
      }
    }
  }
}

main().catch((e) => {
  console.error("Error:", e.response?.data || e.message);
});
