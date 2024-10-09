import * as fs from 'fs';
import { PassThrough, Readable } from 'stream';
import { google } from 'googleapis';
import { GoogleAds, enums } from '../src';

const authClient = new google.auth.JWT({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  subject: '<YOUR_EMAIL>',
  scopes: ['https://www.googleapis.com/auth/youtube'],
});

const yt = google.youtube({ version: 'v3', auth: authClient });

function upload(stream: Readable) {
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

async function main(customer_id: string, login_customer_id: string) {
  /* video */
  const videoPath = '<example_video_file>';

  const buffer = fs.readFileSync(videoPath);

  const videoStream = new PassThrough();
  videoStream.end(buffer);

  const resp = await upload(videoStream);

  /* image */
  const imagePath = '<example_image_file>';

  const imageBuffer = fs.readFileSync(imagePath);

  const imageBase64 = Buffer.from(imageBuffer).toString('base64');

  const service = new GoogleAds({
    auth: authClient,
    developer_token: process.env.DEVELOPER_TOKEN!,
  });

  return service
    .setLoginCustomerId(login_customer_id)
    .setCustomerId(customer_id)
    .mutate({
      mutate_operations: [
        {
          asset_operation: {
            create: {
              name: '<YOUR_ASSET_NAME>',
              type: enums.AssetTypeEnum_AssetType.YOUTUBE_VIDEO,
              youtube_video_asset: {
                youtube_video_id: resp.data.id,
                youtube_video_title: '<YOUR_VIDEO_TITLE>',
              },
            },
          },
        },
        {
          asset_operation: {
            create: {
              name: '<YOUR_ASSET_NAME>',
              type: enums.AssetTypeEnum_AssetType.IMAGE,
              image_asset: {
                data: Buffer.from(imageBase64),
              },
            },
          },
        },
      ],
    });
}
