const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://ctompzbscbugsiswsmlz.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0b21wemJzY2J1Z3Npc3dzbWx6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk1MzAwNywiZXhwIjoyMDg3NTI5MDA3fQ.K2giata3hyP2su4hoQerT248UTV8zSgHDhfCAFNYhe8";
const BUCKET = "product-images";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function main() {
  console.log("1. Checking buckets...");
  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) {
    console.error("   Error listing buckets:", listErr.message);
    return;
  }

  const exists = buckets?.some((b) => b.id === BUCKET);

  if (exists) {
    console.log(`   Bucket "${BUCKET}" exists. Updating to public...`);
    const { error } = await supabase.storage.updateBucket(BUCKET, {
      public: true,
      fileSizeLimit: 10485760,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    });
    if (error) console.error("   Update error:", error.message);
    else console.log("   Updated OK.");
  } else {
    console.log(`   Creating bucket "${BUCKET}"...`);
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 10485760,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    });
    if (error) console.error("   Create error:", error.message);
    else console.log("   Created OK.");
  }

  // Test upload with service_role (bypasses RLS)
  console.log("\n2. Testing upload with service_role key...");
  const testName = `_test_${Date.now()}.png`;
  // 1x1 transparent PNG
  const pngBytes = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQIHWNgAAIABQABNjN9GAAAAABJRU5ErkJggg==",
    "base64"
  );
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(testName, pngBytes, { contentType: "image/png" });

  if (upErr) {
    console.error("   Upload FAILED:", upErr.message);
  } else {
    console.log("   Upload OK!");
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(testName);
    console.log("   Public URL:", data.publicUrl);
    // Cleanup
    await supabase.storage.from(BUCKET).remove([testName]);
    console.log("   Test file cleaned up.");
  }

  console.log("\nDone!");
}

main().catch(console.error);
