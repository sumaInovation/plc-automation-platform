import cloudinary from '@/lib/cloudinary';
import { auth } from '@/auth';

export async function POST(request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return Response.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Folder ekak nathi unoth default eka payment-slips
    const customFolder = formData.get('folder');
    const folderName = customFolder || 'payment-slips';

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `plc-automation/${folderName}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    return Response.json({ 
      success: true, 
      url: result.secure_url,
      folder: folderName 
    });

  } catch (error) {
    console.error("Upload Error:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}