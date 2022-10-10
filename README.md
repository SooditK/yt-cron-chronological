# Fetch YT Videos and Store them in Database

Fetch Youtube Videos and Store them in Database (Prisma as an ORM).

## API Reference

#### Get all Videos stored in Database

```http
  POST /videos
```

| Body | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `id` | `string` | **Optional**. Video ID |


## To Run this in local environment

Before Cloning the Repository, You need two things

`Postgres Database URL` - You can get this from Railway, Render, ElephantSQL

`Youtube API Key` - You can get this from `https://console.cloud.google.com/`


```bash
git clone git@github.com:SooditK/yt-cron-chronological.git
```

```bash
touch .env
```


Open your .env file, and paste the Following


```bash
DATABASE_URL="<YOUR_DATABASE_URL_HERE>"
YOUTUBE_API_KEY="<YOUR_API_KEY_HERE>"
```

#### you can also migrate the database, using `npx prisma db migrate dev`
```bash
npx prisma db push
```

```bash
yarn
```

```bash
yarn dev
```


## Cron Job

We've used `node-cron` to make a Cron Job, that fetches Youtube Videos through Youtube API and Store it into Database using Prisma ORM.

Currently, the CRON JOB runs every 10 seconds. 