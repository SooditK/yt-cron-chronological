import "dotenv/config";
import nodecron from "node-cron";
import express from "express";
import { PrismaClient } from "@prisma/client";
import axios from "axios";

const PORT = process.env.PORT || 3000;

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  res.json({ message: "Hello World!" });
});

// endpoint to fetch the data from the database
app.post("/videos", async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      // return all the videos stored
      const videos = await prisma.youtubeVideo.findMany({
        select: {
          id: true,
          thumbnailUrl: true,
          title: true,
          description: true,
          publishedAt: true,
        },
      });
      await prisma.$disconnect();
      res.json({
        success: true,
        message: "Videos fetched successfully",
        data: videos,
      });
    } else {
      // return a single video
      const video = await prisma.youtubeVideo.findUnique({
        where: {
          id: id,
        },
        select: {
          id: true,
          thumbnailUrl: true,
          title: true,
          description: true,
          publishedAt: true,
        },
      });
      await prisma.$disconnect();
      res.json({
        success: true,
        message: "Video fetched successfully",
        data: video,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// create a cron job to fetch videos from youtube every 10 seconds and save Title, Description, Thumbnail, PublishedAt in the database
nodecron.schedule("*/10 * * * * *", async () => {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=javascript&type=video&key=${process.env.YOUTUBE_API_KEY}`;
  const response = await axios.get(url);
  const { items } = response.data;
  items.forEach(
    async (item: {
      snippet: {
        title: string;
        description: string;
        thumbnails: {
          default: {
            url: string;
          };
          medium: {
            url: string;
          };
        };
        publishedAt: string;
      };
      id: { videoId: string };
    }) => {
      const { id, snippet } = item;
      const { title, description, thumbnails, publishedAt } = snippet;
      const { url } = thumbnails.medium;
      await prisma.youtubeVideo.upsert({
        create: {
          title,
          description,
          thumbnailUrl: url,
          publishedAt,
          id: id.videoId,
          data: JSON.stringify(item),
        },
        update: {
          title,
          description,
          thumbnailUrl: url,
          publishedAt,
          id: id.videoId,
          data: JSON.stringify(item),
        },
        where: {
          id: id.videoId,
        },
      });
      await prisma.$disconnect();
      console.log("Data saved to database");
    }
  );
  console.log("Videos Fetched");
});

app.listen(PORT, () => {
  console.log(`🚀Server listening on port ${PORT}`);
});
