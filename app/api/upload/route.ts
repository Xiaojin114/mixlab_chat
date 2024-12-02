import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as Blob;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // 获取文件名
    const fileName = (file as any).name || 'uploaded-file';
    
    try {
      // 确保上传目录存在
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      // 生成唯一文件名
      const uniqueFileName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = path.join(uploadDir, uniqueFileName);

      // 将文件内容转换为Buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // 写入文件
      await writeFile(filePath, buffer);
      console.log('File saved successfully:', filePath);

      return NextResponse.json({
        success: true,
        url: `/uploads/${uniqueFileName}`,
        name: fileName
      });

    } catch (writeError) {
      console.error('File write error:', writeError);
      return NextResponse.json(
        { error: 'Failed to save file' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Upload handler error:', error);
    return NextResponse.json(
      { error: 'Upload processing failed' },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}; 