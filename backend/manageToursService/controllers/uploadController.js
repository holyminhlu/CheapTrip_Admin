const multer = require('multer');
const Tour = require('../models/Tour');
const Counter = require('../models/Counter');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

async function getNextTourId() {
  const counter = await Counter.findByIdAndUpdate(
    { _id: 'tour_id' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return 'T' + counter.seq.toString().padStart(3, '0');
}

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

// Create tour with image upload (Cloudinary) and file PDF link (Google Drive)
exports.createTourWithImage = async (req, res) => {
  try {
    const tourData = req.body;
    let imageUrl = '';

    // Upload ảnh lên Cloudinary nếu có
    if (req.file) {
      try {
        const result = await streamUpload(req.file.buffer);
        imageUrl = result.secure_url;
      } catch (uploadError) {
        console.error('Upload image error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload image',
          error: uploadError.message
        });
      }
    }

    const tour_id = await getNextTourId();
    const tour = new Tour({
      ...tourData,
      tour_id,
      image_url: imageUrl || tourData.image_url || '',
      file_info: tourData.file_info || '',
      file_name: tourData.file_name || '',
      file_view_url: tourData.file_view_url || ''
    });
    
    await tour.save();
    res.status(201).json({
      success: true,
      message: 'Tour created successfully',
      data: tour,
      tour_id: tour.tour_id
    });
  } catch (error) {
    console.error('Create tour with image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create tour',
      error: error.message
    });
  }
};

// Update tour with image link (Cloudinary)
exports.updateTourWithImage = async (req, res) => {
  try {
    const { id } = req.params;
    const tourData = req.body;
    const updatedTour = await Tour.findByIdAndUpdate(
      id,
      { ...tourData },
      { new: true }
    );
    res.json({
      success: true,
      message: 'Tour updated successfully',
      data: updatedTour
    });
  } catch (error) {
    console.error('Update tour with image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tour',
      error: error.message
    });
  }
};

// Delete tour image
exports.deleteTourImage = async (req, res) => {
  try {
    const { id } = req.params;

    const tour = await Tour.findById(id);
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found'
      });
    }

    // Update tour to remove image
    const updatedTour = await Tour.findByIdAndUpdate(
      id,
      { 
        image_url: null,
        imageFileId: null
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Tour image deleted successfully',
      data: updatedTour
    });
  } catch (error) {
    console.error('Delete tour image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete tour image',
      error: error.message
    });
  }
}; 