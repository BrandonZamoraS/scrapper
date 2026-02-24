const axios = require("axios");

const TOKEN = "apify_api_6Dx1JmosQBifnoVvVAJ9IlzcrQB9Qz27Hcyu";
const IMAGE_URL = "https://ctompzbscbugsiswsmlz.supabase.co/storage/v1/object/public/product-images/1771958169087-5e1dlo.webp";

async function main() {
  // First, let's try the borderline/google-lens actor
  console.log("=== Testing borderline/google-lens ===\n");

  try {
    const res = await axios.post(
      "https://api.apify.com/v2/acts/borderline~google-lens/run-sync-get-dataset-items",
      { imageUrl: IMAGE_URL, mode: "search" },
      {
        params: { token: TOKEN, timeout: 120 },
        headers: { "Content-Type": "application/json" },
        timeout: 130000,
      }
    );

    console.log("Status:", res.status);
    console.log("IsArray:", Array.isArray(res.data));
    console.log("Length:", res.data?.length);

    if (Array.isArray(res.data) && res.data.length > 0) {
      console.log("\nFirst item keys:", Object.keys(res.data[0]));
      console.log("\nFirst 2 items:");
      for (const item of res.data.slice(0, 2)) {
        console.log(JSON.stringify(item, null, 2).substring(0, 1500));
        console.log("---");
      }
    } else {
      console.log("Data:", JSON.stringify(res.data, null, 2).substring(0, 2000));
    }
  } catch (e) {
    console.error("Error:", e.response?.status);
    console.error("Body:", JSON.stringify(e.response?.data, null, 2)?.substring(0, 1500) || e.message);

    // If that fails, try the epctex actor
    console.log("\n=== Trying epctex/google-shopping-scraper ===\n");
    try {
      const res2 = await axios.post(
        "https://api.apify.com/v2/acts/epctex~google-shopping-scraper/run-sync-get-dataset-items",
        { searchTerms: ["dining chair wood"], maxItems: 5, countryCode: "us" },
        {
          params: { token: TOKEN, timeout: 120 },
          headers: { "Content-Type": "application/json" },
          timeout: 130000,
        }
      );

      console.log("Status:", res2.status);
      console.log("IsArray:", Array.isArray(res2.data));
      console.log("Length:", res2.data?.length);
      if (Array.isArray(res2.data) && res2.data.length > 0) {
        console.log("\nFirst item keys:", Object.keys(res2.data[0]));
        console.log(JSON.stringify(res2.data[0], null, 2).substring(0, 1500));
      }
    } catch (e2) {
      console.error("Error:", e2.response?.status);
      console.error("Body:", JSON.stringify(e2.response?.data, null, 2)?.substring(0, 1000) || e2.message);
    }
  }
}

main();
