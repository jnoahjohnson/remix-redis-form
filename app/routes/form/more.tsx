import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import {
  getDataFromRedis,
  requireFormData,
  saveToRedis,
} from "~/services/redis.server";
import type { CustomFormData } from "~/types/form";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const id = formData.get("id");
  const bio = formData.get("bio");
  const birthday = formData.get("birthday");
  const age = formData.get("age");

  if (
    typeof id !== "string" ||
    typeof bio !== "string" ||
    typeof birthday !== "string" ||
    typeof age !== "string"
  ) {
    throw Error("Form data is invalid");
  }

  const customFormData = await getDataFromRedis(id);

  if (!customFormData) {
    throw Error("Form data is not found");
  }

  customFormData.bio = bio;
  customFormData.birthday = new Date(birthday);
  customFormData.age = parseInt(age);

  await saveToRedis(customFormData);

  return redirect(`/form/confirm?id=${customFormData.id}`);
};

export const loader: LoaderFunction = async ({ request }) => {
  // Function in redis.server.ts that is reusable for each page of the form
  const formData = await requireFormData(request);

  return formData;
};

export default function MoreForm() {
  const formData = useLoaderData<CustomFormData>();

  return (
    <div>
      <h2 className="text-lg text-gray-600">More Info</h2>
      <Form method="post">
        <input type="hidden" name="id" value={formData.id} />
        <label className="mb-1">
          Bio
          <input
            type="text"
            name="bio"
            placeholder="Bio"
            defaultValue={formData.bio}
            className="mb-2 w-full p-2 text-lg shadow-md"
          />
        </label>
        <label className="mb-1">
          Birthday
          <input
            type="date"
            name="birthday"
            defaultValue={String(formData.birthday).split("T")[0] || ""}
            className="mb-2 w-full p-2 text-lg shadow-md"
          />
        </label>
        <label className="mb-1">
          Age
          <input
            type="number"
            name="age"
            placeholder="0"
            defaultValue={formData.age?.toString()}
            className="mb-2 w-full p-2 text-lg shadow-md"
          />
        </label>
        <button className="mx-auto mt-2 block w-1/2 rounded bg-blue-600 py-2 text-white hover:bg-blue-700">
          Continue
        </button>
      </Form>
    </div>
  );
}
