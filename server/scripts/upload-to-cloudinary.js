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

const categoryImages = {
  'Road Repair': [
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1584985223049-741cefae2494?auto=format&fit=crop&w=800&q=80'
  ],
  'Street Lighting': [
    'https://images.unsplash.com/photo-1533036814674-cfa686fc2424?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1584282463248-12c8b05da26b?auto=format&fit=crop&w=800&q=80'
  ],
  'Water Supply Issue': [
    'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1585827552668-d0728b355e3c?auto=format&fit=crop&w=800&q=80'
  ],
  'Sewerage Problem': [
    'https://images.unsplash.com/photo-1621516625895-d603a1188365?auto=format&fit=crop&w=800&q=80'
  ],
  'Garbage Collection': [
    'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1605600659905-2457cbe80738?auto=format&fit=crop&w=800&q=80'
  ],
  'Traffic Management': [
    'https://images.unsplash.com/photo-1566838316377-f2da157c164a?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1549615024-db01a6b0c266?auto=format&fit=crop&w=800&q=80'
  ],
  'Public Health': [
    'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?auto=format&fit=crop&w=800&q=80'
  ],
  'Public Safety': [
    'https://images.unsplash.com/photo-1517686520775-6e069c99ec17?auto=format&fit=crop&w=800&q=80'
  ]
};

async function main() {
  console.log('🚀 Starting Cloudinary Upload Process...');
  const newCategoryImages = {};

  for (const [category, urls] of Object.entries(categoryImages)) {
    newCategoryImages[category] = [];
    console.log(`\n📂 Processing category: ${category}`);
    
    for (const url of urls) {
      try {
        console.log(`   ⬆️ Uploading: ${url}`);
        const result = await cloudinary.uploader.upload(url, {
          folder: 'nayibareilly/seeds',
          resource_type: 'image',
          quality: 'auto:good' // compress
        });
        console.log(`   ✅ Success: ${result.secure_url}`);
        newCategoryImages[category].push(result.secure_url);
      } catch (error) {
        console.error(`   ❌ Failed to upload ${url}:`, error.message);
        newCategoryImages[category].push(url); // fallback to original if failed
      }
    }
  }

  // Generate output format for seed script
  console.log('\n=============================================');
  console.log('REPLACE THE CATEGORY_IMAGES OBJECT IN YOUR SEED SCRIPT WITH THIS:');
  console.log('=============================================');
  
  let output = '  const categoryImages = {\n';
  for (const [category, urls] of Object.entries(newCategoryImages)) {
    output += `    '${category}': [\n`;
    for (const url of urls) {
      output += `      '${url}',\n`;
    }
    output += `    ],\n`;
  }
  output += '  };\n';
  
  console.log(output);
  
  fs.writeFileSync('cloudinary-links.txt', output);
  console.log('✅ Links saved to cloudinary-links.txt');
}

main().catch(console.error);
