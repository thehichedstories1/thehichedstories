const fs = require('fs');
const path = require('path');
require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Maps filter-button category => Cloudinary folder path => display label
const SECTIONS = [
  { category: 'weddings',    folder: 'thehitchedstories/image/Weddings',        label: 'Weddings' },
  { category: 'prewedding',  folder: 'thehitchedstories/image/Pre-wedding',     label: 'Pre-Wedding' },
  { category: 'couples',     folder: 'thehitchedstories/image/Couple',          label: 'Couples' },
  { category: 'candid',      folder: 'thehitchedstories/image/Candid Moments',  label: 'Candid Moments' },
  { category: 'stories',     folder: 'thehitchedstories/Stories',               label: 'Stories' },
];

const MAX_PER_SECTION = 500; // max images per category
const PORTFOLIO_FILE = path.join(__dirname, 'portfolio.html');

async function getImagesFromFolder(folderPath, maxResults) {
  try {
    console.log(`  Fetching: ${folderPath}...`);
    const result = await cloudinary.search
      .expression(`folder:"${folderPath}"`)
      .sort_by('public_id', 'desc')
      .max_results(maxResults)
      .execute();

    return result.resources.map(res => ({
      url: res.secure_url.replace('/upload/', '/upload/f_auto,q_auto,w_800/'),
      public_id: res.public_id,
    }));
  } catch (error) {
    if (error.error && error.error.http_code === 401) {
      console.error('Authentication Error: Check your .env file!');
      process.exit(1);
    }
    console.error(`  Error fetching ${folderPath}:`, error.message);
    return [];
  }
}

function cleanTitle(publicId) {
  let name = publicId.split('/').pop();
  // Remove common suffixes like _abc123
  name = name.replace(/_[a-z0-9]{6}$/i, '');
  // Remove file-like patterns
  name = name.replace(/^jpegg?_Page_\d+$/i, '');
  name = name.replace(/_/g, ' ').replace(/-/g, ' ');
  name = name.trim();
  if (!name) return 'Moment';
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function buildGalleryItemHTML(img, category) {
  const title = cleanTitle(img.public_id);
  return `                <div class="gallery-item reveal" data-category="${category}">
                    <img src="${img.url}" alt="${title}" loading="lazy">
                    <div class="gallery-item__overlay">
                        <div class="gallery-item__info">
                            <h4 class="gallery-item__title">${title}</h4>
                            <p class="gallery-item__category">${category}</p>
                        </div>
                    </div>
                </div>`;
}

async function syncPortfolio() {
  if (!process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY === 'your_api_key_here') {
    console.log('ERROR: .env has no real API key. Add your Cloudinary credentials first.');
    return;
  }

  console.log('Syncing portfolio images from Cloudinary...\n');

  // Build HTML: images grouped by section, each section separated by a comment
  let galleryHtml = '';
  let totalImages = 0;

  for (const section of SECTIONS) {
    const images = await getImagesFromFolder(section.folder, MAX_PER_SECTION);
    console.log(`  ✓ ${section.label}: ${images.length} images\n`);

    if (images.length === 0) continue;

    galleryHtml += `\n                <!-- ===== ${section.label} ===== -->\n`;
    for (const img of images) {
      galleryHtml += buildGalleryItemHTML(img, section.category) + '\n';
    }
    totalImages += images.length;
  }

  if (totalImages === 0) {
    console.log('No images found in any folder. Exiting.');
    return;
  }

  // Read portfolio.html and replace gallery grid contents
  let html = fs.readFileSync(PORTFOLIO_FILE, 'utf-8');

  // Match content between <div class="gallery-grid" id="portfolioGrid"> ... closing </div> before </section>
  const regex = /(<div class="gallery-grid" id="portfolioGrid">)([\s\S]*?)(\s*<\/div>\s*<\/div>\s*<\/section>)/;

  const match = html.match(regex);
  if (match) {
    html = html.replace(regex, `$1\n${galleryHtml}\n            $3`);
    fs.writeFileSync(PORTFOLIO_FILE, html, 'utf-8');
    console.log(`\n✅ Updated portfolio.html with ${totalImages} images across ${SECTIONS.length} sections!`);
  } else {
    console.log('Could not find the gallery-grid block in portfolio.html.');
    console.log('Trying alternate regex...');
    
    // Try a simpler match
    const altRegex = /(<div class="gallery-grid" id="portfolioGrid">)([\s\S]*?)(\n\s*<\/div>)/;
    const altMatch = html.match(altRegex);
    if (altMatch) {
      html = html.replace(altRegex, `$1\n${galleryHtml}\n            $3`);
      fs.writeFileSync(PORTFOLIO_FILE, html, 'utf-8');
      console.log(`\n✅ Updated portfolio.html with ${totalImages} images across ${SECTIONS.length} sections!`);
    } else {
      console.log('ERROR: Could not locate gallery grid in portfolio.html');
    }
  }
}

syncPortfolio();
