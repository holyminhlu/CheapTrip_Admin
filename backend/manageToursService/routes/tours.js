const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tourController');
const uploadController = require('../controllers/uploadController');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// CRUD
router.get('/', tourController.getAllTours);
router.get('/:id', tourController.getTourById);
router.post('/', tourController.createTour);
router.put('/:id', tourController.updateTour);
router.delete('/:id', tourController.deleteTour);
router.post('/hide-many', tourController.hideManyTours);
router.put('/:id/toggle-hide', tourController.toggleHideTour);

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Google Drive upload routes
router.post('/with-image', upload.single('image'), uploadController.createTourWithImage);
router.put('/:id/with-image', upload.single('image'), uploadController.updateTourWithImage);

// Route upload ảnh lên Cloudinary và lưu vào database
router.post('/upload/:tourId', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    // Upload buffer lên Cloudinary
    const streamUpload = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'tours' },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(buffer).pipe(stream);
      });
    };

    const result = await streamUpload(req.file.buffer);

    // Lưu link vào database
    const updatedTour = await require('../models/Tour').findByIdAndUpdate(
      req.params.tourId,
      { image_url: result.secure_url },
      { new: true }
    );

    res.json({ url: result.secure_url, tour: updatedTour });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi upload Cloudinary', details: err });
  }
});

module.exports = router;