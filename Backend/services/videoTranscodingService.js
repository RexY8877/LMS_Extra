const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

// Video resolution configurations
const VIDEO_RESOLUTIONS = {
  '360p': { width: 640, height: 360, bitrate: '800k' },
  '480p': { width: 854, height: 480, bitrate: '1200k' },
  '720p': { width: 1280, height: 720, bitrate: '2500k' },
  '1080p': { width: 1920, height: 1080, bitrate: '5000k' }
};

// Set FFmpeg path if needed (for Windows/production environments)
if (process.env.FFMPEG_PATH) {
  ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
}

if (process.env.FFPROBE_PATH) {
  ffmpeg.setFfprobePath(process.env.FFPROBE_PATH);
}

/**
 * Get video metadata using FFprobe
 */
const getVideoMetadata = (inputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) {
        reject(new Error(`Failed to get video metadata: ${err.message}`));
        return;
      }

      const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
      const audioStream = metadata.streams.find(stream => stream.codec_type === 'audio');

      if (!videoStream) {
        reject(new Error('No video stream found in file'));
        return;
      }

      resolve({
        duration: parseFloat(metadata.format.duration) || 0,
        width: videoStream.width,
        height: videoStream.height,
        bitrate: parseInt(metadata.format.bit_rate) || 0,
        fps: eval(videoStream.r_frame_rate) || 0,
        hasAudio: !!audioStream,
        fileSize: parseInt(metadata.format.size) || 0,
        format: metadata.format.format_name
      });
    });
  });
};

/**
 * Transcode video to MP4 H.264 format with specific resolution
 */
const transcodeVideo = (inputPath, outputPath, resolution, onProgress) => {
  return new Promise((resolve, reject) => {
    const config = VIDEO_RESOLUTIONS[resolution];
    if (!config) {
      reject(new Error(`Unsupported resolution: ${resolution}`));
      return;
    }

    const command = ffmpeg(inputPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .size(`${config.width}x${config.height}`)
      .videoBitrate(config.bitrate)
      .audioBitrate('128k')
      .format('mp4')
      .outputOptions([
        '-preset fast',
        '-crf 23',
        '-movflags +faststart' // Enable progressive download
      ]);

    if (onProgress) {
      command.on('progress', (progress) => {
        onProgress({
          resolution,
          percent: progress.percent || 0,
          currentTime: progress.timemark,
          targetSize: progress.targetSize
        });
      });
    }

    command
      .on('end', () => {
        resolve({
          resolution,
          outputPath,
          success: true
        });
      })
      .on('error', (err) => {
        reject(new Error(`Transcoding failed for ${resolution}: ${err.message}`));
      })
      .save(outputPath);
  });
};

/**
 * Extract thumbnail from video at specified time
 */
const extractThumbnail = (inputPath, outputPath, timeInSeconds = 5) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .screenshots({
        timestamps: [timeInSeconds],
        filename: path.basename(outputPath),
        folder: path.dirname(outputPath),
        size: '320x240'
      })
      .on('end', () => {
        resolve(outputPath);
      })
      .on('error', (err) => {
        reject(new Error(`Thumbnail extraction failed: ${err.message}`));
      });
  });
};

/**
 * Generate HLS playlist for adaptive streaming
 */
const generateHLSPlaylist = (videoFiles, outputDir, baseUrl) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Create master playlist
      const masterPlaylistPath = path.join(outputDir, 'master.m3u8');
      let masterPlaylist = '#EXTM3U\n#EXT-X-VERSION:3\n\n';

      // Sort resolutions by quality (lowest to highest)
      const sortedResolutions = Object.keys(VIDEO_RESOLUTIONS).sort((a, b) => {
        return parseInt(a) - parseInt(b);
      });

      for (const resolution of sortedResolutions) {
        if (videoFiles[resolution]) {
          const config = VIDEO_RESOLUTIONS[resolution];
          const bandwidth = parseInt(config.bitrate) * 1000; // Convert to bps
          
          masterPlaylist += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${config.width}x${config.height}\n`;
          masterPlaylist += `${baseUrl}/${resolution}/playlist.m3u8\n\n`;
        }
      }

      await fs.writeFile(masterPlaylistPath, masterPlaylist);

      // Generate individual playlists for each resolution
      for (const resolution of sortedResolutions) {
        if (videoFiles[resolution]) {
          const resolutionDir = path.join(outputDir, resolution);
          await fs.mkdir(resolutionDir, { recursive: true });
          
          const playlistPath = path.join(resolutionDir, 'playlist.m3u8');
          const segmentDuration = 10; // 10 seconds per segment
          
          await new Promise((resolveSegment, rejectSegment) => {
            ffmpeg(videoFiles[resolution])
              .outputOptions([
                '-c copy',
                '-f hls',
                `-hls_time ${segmentDuration}`,
                '-hls_playlist_type vod',
                '-hls_segment_filename', path.join(resolutionDir, 'segment_%03d.ts')
              ])
              .output(playlistPath)
              .on('end', resolveSegment)
              .on('error', rejectSegment)
              .run();
          });
        }
      }

      resolve(masterPlaylistPath);
    } catch (error) {
      reject(new Error(`HLS playlist generation failed: ${error.message}`));
    }
  });
};

/**
 * Process video: transcode to multiple resolutions, extract thumbnail, create HLS playlist
 */
const processVideo = async (inputPath, outputDir, baseUrl, onProgress) => {
  try {
    // Create output directory
    await fs.mkdir(outputDir, { recursive: true });

    // Get video metadata
    const metadata = await getVideoMetadata(inputPath);
    
    // Determine which resolutions to generate based on input resolution
    const inputHeight = metadata.height;
    const resolutionsToGenerate = Object.keys(VIDEO_RESOLUTIONS).filter(res => {
      const targetHeight = VIDEO_RESOLUTIONS[res].height;
      return targetHeight <= inputHeight;
    });

    if (resolutionsToGenerate.length === 0) {
      // If input is smaller than 360p, just use 360p
      resolutionsToGenerate.push('360p');
    }

    // Transcode to different resolutions
    const transcodedFiles = {};
    const totalResolutions = resolutionsToGenerate.length;
    let completedResolutions = 0;

    for (const resolution of resolutionsToGenerate) {
      const outputPath = path.join(outputDir, `${resolution}.mp4`);
      
      try {
        await transcodeVideo(inputPath, outputPath, resolution, (progress) => {
          if (onProgress) {
            const overallProgress = (completedResolutions / totalResolutions) * 100 + 
                                  (progress.percent / totalResolutions);
            onProgress({
              stage: 'transcoding',
              resolution: progress.resolution,
              percent: Math.min(overallProgress, 100),
              currentResolution: progress.resolution,
              resolutionProgress: progress.percent
            });
          }
        });
        
        transcodedFiles[resolution] = outputPath;
        completedResolutions++;
        
        if (onProgress) {
          onProgress({
            stage: 'transcoding',
            percent: (completedResolutions / totalResolutions) * 80, // 80% for transcoding
            completedResolutions,
            totalResolutions
          });
        }
      } catch (error) {
        console.error(`Failed to transcode ${resolution}:`, error.message);
        // Continue with other resolutions
      }
    }

    // Extract thumbnail
    if (onProgress) {
      onProgress({ stage: 'thumbnail', percent: 85 });
    }
    
    const thumbnailPath = path.join(outputDir, 'thumbnail.jpg');
    await extractThumbnail(inputPath, thumbnailPath, 5);

    // Generate HLS playlist
    if (onProgress) {
      onProgress({ stage: 'playlist', percent: 95 });
    }
    
    const playlistPath = await generateHLSPlaylist(transcodedFiles, outputDir, baseUrl);

    if (onProgress) {
      onProgress({ stage: 'complete', percent: 100 });
    }

    return {
      success: true,
      metadata,
      transcodedFiles,
      thumbnailPath,
      playlistPath,
      resolutions: Object.keys(transcodedFiles),
      outputDir
    };

  } catch (error) {
    throw new Error(`Video processing failed: ${error.message}`);
  }
};

/**
 * Clean up temporary files
 */
const cleanupFiles = async (filePaths) => {
  for (const filePath of filePaths) {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error(`Failed to cleanup file ${filePath}:`, error.message);
    }
  }
};

module.exports = {
  getVideoMetadata,
  transcodeVideo,
  extractThumbnail,
  generateHLSPlaylist,
  processVideo,
  cleanupFiles,
  VIDEO_RESOLUTIONS
};