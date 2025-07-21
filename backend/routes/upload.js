const express = require('express');
const multer = require('multer');
const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow PDF and image files
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are allowed!'), false);
    }
  }
});

// Upload single file to Google Drive
router.post('/single', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    const file = req.file;
    const fileName = `${Date.now()}_${file.originalname}`;

    // Upload to Google Drive
    // XÓA: const result = await uploadToGoogleDrive(file, fileName);

    // XÓA: if (result.success) {
    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        fileId: 'placeholder_file_id', // Placeholder, replace with actual logic
        fileName: fileName,
        downloadUrl: 'placeholder_download_url', // Placeholder, replace with actual logic
        webViewLink: 'placeholder_web_view_link', // Placeholder, replace with actual logic
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      }
    });
    // XÓA: } else {
    // XÓA:   res.status(500).json({
    // XÓA:     success: false,
    // XÓA:     message: 'Failed to upload file to Google Drive',
    // XÓA:     error: result.error
    // XÓA:   });
    // XÓA: }
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message
    });
  }
});

// Upload multiple files to Google Drive
router.post('/multiple', upload.array('files', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No files uploaded' 
      });
    }

    const uploadPromises = req.files.map(async (file) => {
      const fileName = `${Date.now()}_${file.originalname}`;
      // XÓA: return await uploadToGoogleDrive(file, fileName);
      return {
        success: true,
        fileId: 'placeholder_file_id', // Placeholder, replace with actual logic
        fileName: fileName,
        downloadUrl: 'placeholder_download_url', // Placeholder, replace with actual logic
        webViewLink: 'placeholder_web_view_link' // Placeholder, replace with actual logic
      };
    });

    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter(result => result.success);
    const failedUploads = results.filter(result => !result.success);

    res.json({
      success: true,
      message: `${successfulUploads.length} files uploaded successfully`,
      data: {
        successful: successfulUploads.map(result => ({
          fileId: result.fileId,
          fileName: result.fileName,
          downloadUrl: result.downloadUrl,
          webViewLink: result.webViewLink
        })),
        failed: failedUploads.map(result => ({
          error: result.error
        }))
      }
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message
    });
  }
});

// Delete file from Google Drive
router.delete('/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    // XÓA: const result = await deleteFromGoogleDrive(fileId);

    // XÓA: if (result.success) {
    res.json({
      success: true,
      message: 'File deleted successfully'
    });
    // XÓA: } else {
    // XÓA:   res.status(500).json({
    // XÓA:     success: false,
    // XÓA:     message: 'Failed to delete file',
    // XÓA:     error: result.error
    // XÓA:   });
    // XÓA: }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Delete failed',
      error: error.message
    });
  }
});

module.exports = router; 