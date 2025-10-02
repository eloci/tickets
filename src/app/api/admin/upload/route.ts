import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                               process.env.CLOUDINARY_API_KEY && 
                               process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  console.warn('⚠️ Cloudinary not configured. File uploads will use base64 data URLs.');
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Upload request received...');
    
    // Set proper content type header to ensure JSON response
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Auth check
    const { userId } = await auth();
    if (!userId) {
      console.log('❌ No userId found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers });
    }
    console.log('✅ User authenticated:', userId);

    // Get form data
    const formData = await request.formData();
    console.log('📋 Form data entries:', Array.from(formData.keys()));
    
    // Try both 'file' and 'files' keys
    let file = formData.get('file') as File;
    if (!file) {
      file = formData.get('files') as File;
    }
    if (!file) {
      const allFiles = formData.getAll('file') as File[];
      if (allFiles.length > 0) {
        file = allFiles[0];
      }
    }

    if (!file || file.size === 0) {
      console.log('❌ No file found in form data');
      console.log('Form data keys:', Array.from(formData.keys()));
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    
    console.log('📁 File found:', file.name, 'Size:', file.size, 'Type:', file.type);

    // Validate file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!allowedTypes.includes(file.type)) {
      console.log('❌ Invalid file type:', file.type);
      return NextResponse.json({
        error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
      }, { status: 400 });
    }
    
    if (file.size > maxSize) {
      console.log('❌ File too large:', file.size);
      return NextResponse.json({
        error: `File is too large. Maximum size is 10MB.`
      }, { status: 400 });
    }

    // Convert file to buffer for processing
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const filename = `${timestamp}-${randomString}.${fileExtension}`;

    let imageUrl: string;

    if (isCloudinaryConfigured) {
      // Upload to Cloudinary
      const publicId = `uploads/${timestamp}-${randomString}`;
      
      const uploadResponse = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            public_id: publicId,
            folder: 'concert-tickets',
            transformation: [
              { width: 1500, height: 1500, crop: 'limit' },
              { quality: 'auto:good' }
            ]
          },
          (error, result) => {
            if (error) {
              console.error('❌ Cloudinary upload error:', error);
              reject(error);
            } else {
              console.log('✅ Cloudinary upload success:', result?.secure_url);
              resolve(result);
            }
          }
        ).end(buffer);
      });

      imageUrl = (uploadResponse as any).secure_url;
      console.log('✅ File uploaded successfully to Cloudinary:', imageUrl);
    } else {
      // Fallback: Convert to base64 data URL (temporary solution)
      const base64 = buffer.toString('base64');
      const mimeType = file.type || 'image/png';
      imageUrl = `data:${mimeType};base64,${base64}`;
      console.log('⚠️ Using base64 fallback (configure Cloudinary for production)');
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      filename,
      files: [imageUrl] // Add this for compatibility with existing code
    }, { 
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('❌ Error uploading file:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload file',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}