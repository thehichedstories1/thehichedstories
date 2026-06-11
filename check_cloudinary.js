require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function check() {
  try {
    const result = await cloudinary.api.root_folders();
    console.log("Root Folders:", result.folders);
    
    // Check if there is a 'thehitchedstories' folder
    const hitchFolder = result.folders.find(f => f.name === 'thehitchedstories');
    if (hitchFolder) {
        const subResult = await cloudinary.api.sub_folders('thehitchedstories');
        console.log("Subfolders of thehitchedstories:", subResult.folders);
    }
  } catch (err) {
    console.error(err);
  }
}

check();
