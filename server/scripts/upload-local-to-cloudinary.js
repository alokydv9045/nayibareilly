import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables from server/.env
dotenv.config({ path: path.join(process.cwd(), '.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const localImages = {
  'civic_pothole': 'C:\\Users\\Acer\\.gemini\\antigravity\\brain\\cae58ffa-98ec-4195-a454-cfd9671f33ab\\civic_pothole_1782978140428.png',
  'civic_streetlight': 'C:\\Users\\Acer\\.gemini\\antigravity\\brain\\cae58ffa-98ec-4195-a454-cfd9671f33ab\\civic_streetlight_1782978151426.png',
  'civic_garbage': 'C:\\Users\\Acer\\.gemini\\antigravity\\brain\\cae58ffa-98ec-4195-a454-cfd9671f33ab\\civic_garbage_1782978161926.png',
  'civic_waterleak': 'C:\\Users\\Acer\\.gemini\\antigravity\\brain\\cae58ffa-98ec-4195-a454-cfd9671f33ab\\civic_waterleak_1782978173542.png'
};

async function main() {
  console.log('🚀 Uploading local AI generated images to Cloudinary...');
  const uploadedUrls = {};

  for (const [key, filepath] of Object.entries(localImages)) {
    try {
      console.log(`   ⬆️ Uploading: ${key}`);
      const result = await cloudinary.uploader.upload(filepath, {
        folder: 'nayibareilly/seeds',
        resource_type: 'image',
        quality: 'auto:good'
      });
      console.log(`   ✅ Success: ${result.secure_url}`);
      uploadedUrls[key] = result.secure_url;
    } catch (error) {
      console.error(`   ❌ Failed to upload ${key}:`, error.message);
    }
  }

  // Generate output format for seed script
  console.log('\n=============================================');
  console.log('CLOUDINARY URLS:');
  console.log(JSON.stringify(uploadedUrls, null, 2));
  console.log('=============================================');
  
  fs.writeFileSync('cloudinary-local-links.json', JSON.stringify(uploadedUrls, null, 2));
  console.log('✅ Links saved to cloudinary-local-links.json');
}

main().catch(console.error);
