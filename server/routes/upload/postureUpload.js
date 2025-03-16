const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const Pig = require('../../models/Pig');
const PigPosture = require('../../models/PostureData');

const upload = multer({ dest: 'uploads/' });

router.post('/:pig_id', upload.single('file'), async (req, res) => {
  const { pig_id } = req.params;

  if (!pig_id || isNaN(pig_id)) {
    return res.status(400).json({ error: 'Invalid pig_id. Must be a number.' });
  }

  const filePath = req.file.path;

  try {
    const pig = await Pig.findOne({ pigId: Number(pig_id) });
    if (!pig) {
      return res.status(404).json({ error: 'Pig not found' });
    }

    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        for (const row of results) {
          const { Timestamp, Posture } = row;

          try {
            // Parse the timestamp into a valid Date object
            const [year, month, day, hour, minute, second] = Timestamp.split('_');
            const timestamp = new Date(
              `${year}-${month}-${day}T${hour}:${minute}:${second}Z`
            );

            // Validate the timestamp
            if (isNaN(timestamp.getTime())) {
              console.error('Invalid Timestamp:', Timestamp);
              continue; // Skip this row
            }

            // Convert the Date object to an ISO string for MongoDB
            const isoTimestamp = timestamp.toISOString();

            // // Parse the Posture score
            // const postureScore = parseInt(Posture, 10);

            // // Validate the Posture score (must be between 0 and 5)
            // if (isNaN(postureScore) || postureScore < 0 || postureScore > 5) {
            //   console.error('Invalid Posture Score:', Posture);
            //   continue; // Skip this row
            // }

            // Save the posture data
            const postureData = new PigPosture({
              pigId: pig._id,
              timestamp: isoTimestamp,
              score: Posture,
            });

            await postureData.save();
          } catch (error) {
            console.error('Error processing row:', row, error);
          }
        }

        // Clean up the uploaded file
        fs.unlinkSync(filePath);

        res.status(200).json({ message: 'Posture data uploaded successfully' });
      })
      .on('error', (error) => {
        console.error('Error reading CSV file:', error);
        res.status(500).json({ error: 'Failed to read CSV file' });
      });
  } catch (error) {
    console.error('Error uploading posture data:', error);
    res.status(500).json({ error: 'Failed to upload posture data' });
  }
});

module.exports = router;