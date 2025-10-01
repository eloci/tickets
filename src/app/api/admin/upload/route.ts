import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

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

    // Create upload directory
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const filename = `${timestamp}-${randomString}.${fileExtension}`;
    const filepath = join(uploadDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    const imageUrl = `/uploads/${filename}`;
    console.log('✅ File uploaded successfully:', imageUrl);

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