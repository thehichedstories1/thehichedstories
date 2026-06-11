require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const folders = [
  'thehitchedstories/image/Weddings',
  'thehitchedstories/image/Pre-wedding',
  'thehitchedstories/image/Couple',
  'thehitchedstories/image/Candid Moments',
  'thehitchedstories/Stories',
  'thehitchedstories/image/All',
  'thehitchedstories/image/Team',
];

async function listAll() {
  console.log('=== All Cloudinary Images ===\n');
  let grandTotal = 0;

  for (const folder of folders) {
    try {
      const result = await cloudinary.search
        .expression(`folder:"${folder}"`)
        .sort_by('public_id', 'asc')
        .max_results(500)
        .execute();

      console.log(`📁 ${folder}: ${result.total_count} images`);
      result.resources.forEach(r => {
        console.log(`   - ${r.public_id} (${r.format}, ${r.width}x${r.height})`);
      });
      grandTotal += result.total_count;
      console.log();
    } catch (e) {
      console.log(`📁 ${folder}: ERROR - ${e.message}\n`);
    }
  }

  console.log(`\n=== GRAND TOTAL: ${grandTotal} images ===`);
}

listAll();
