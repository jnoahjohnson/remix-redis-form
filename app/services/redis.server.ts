import * as redis from "redis";
import type { CustomFormData } from "~/types/form";

const client = redis.createClient({
  url: process.env.REDIS_URL,
});

client.on("error", (err) => console.log("Redis client error", err));

// If you update the data type, update the key version so you are not left with invalid states
const KEY_VERSION = "1";

export const saveToRedis = async (data: CustomFormData) => {
  await client.connect();
  await client.set(`f-${KEY_VERSION}-${data.id}`, JSON.stringify(data));
  await client.quit();
};

// export const getKey = async (key: string) => {
//   await client.connect();
//   const value = await client.get(key);
//   await client.quit();

//   return value;
// };

export const getDataFromRedis = async (
  id: string
): Promise<CustomFormData | null> => {
  // Get data from redis
  await client.connect();
  const data = await client.get(`f-${KEY_VERSION}-${id}`);
  await client.quit();

  if (!data) {
    return null;
  }

  const formData = JSON.parse(data) as CustomFormData;

  return formData;
};

export const requireFormData = async (
  request: Request
): Promise<CustomFormData> => {
  // Get ID from search params
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (typeof id !== "string" || !id) {
    throw Error("Issue getting id");
  }

  // Get cached form data from Redis
  const formData = await getDataFromRedis(id);

  if (!formData) {
    throw Error("No Data Found");
  }

  return formData;
};

export const deleteFormData = async (id: string) => {
  await client.connect();
  await client.del(`f-${KEY_VERSION}-${id}`);
  await client.quit();
};
