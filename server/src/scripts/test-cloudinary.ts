import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function test() {
  try {
    console.log('Keys:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET?.slice(0, 3) + '...',
    });
    
    console.log('Pinging...');
    const ping = await cloudinary.api.ping();
    console.log('Ping success:', ping);

    console.log('Uploading dummy image...');
    // Base64 1x1 pixel transparent gif
    const dummyImage = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
    const uploadResult = await cloudinary.uploader.upload(dummyImage, {
      folder: 'test_folder',
    });
    console.log('Upload success:', uploadResult.secure_url);
  } catch (err) {
    console.error('Cloudinary Error Details:', err);
  }
}

test();
