import { Readable } from 'stream';
import { google } from 'googleapis';

const authClient = new google.auth.JWT({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  subject: 'htdangkhoa@htdangkhoa.com',
  scopes: ['https://www.googleapis.com/auth/youtube'],
});

export function upload(stream: Readable) {
  const yt = google.youtube({ version: 'v3', auth: authClient });

  // const videoPath = path.join(__dirname, 'video.mp4');

  // const buffer = fs.readFileSync(videoPath);

  // // convert buffer to stream
  // const videoStream = new PassThrough();
  // videoStream.end(buffer);

  return yt.videos.insert({
    part: ['snippet', 'contentDetails', 'status'],
    requestBody: {
      snippet: {
        title: 'My title',
        description: 'My title',
        tags: ['test'],
      },
      status: {
        privacyStatus: 'private', // public, private, unlisted
      },
    },
    media: {
      body: stream,
    },
  });
}
