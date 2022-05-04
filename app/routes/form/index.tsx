import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { getDataFromRedis, saveToRedis } from "~/services/redis.server";
import type { CustomFormData } from "~/types/form";
import { generateCode } from "../utils/helpers.server";

export const action: ActionFunction = async ({ request }) => {
  // Get the form data from the request.
  const formData = await request.formData();

  // Get each form element
  const name = formData.get("name");
  const phone = formData.get("phone");
  const email = formData.get("email");

  // Check if the form data is valid
  if (
    typeof name !== "string" ||
    typeof phone !== "string" ||
    typeof email !== "string"
  ) {
    throw Error("Form data is invalid"); // This error could be handled differently, but we will keep it for now
  }

  // Check if there is already an ID
  const formId = formData.get("id");
  let id = "";

  // No need to generate a new code if you already have one
  // Also, if you already have one a generate a new code, then you will lose the old data
  if (typeof formId === "string" && formId !== "") {
    console.log(formId);
    id = formId;

    const formDataObject = await getDataFromRedis(id);

    if (!formDataObject) {
      throw Error("Form data is not found");
    }

    formDataObject.name = name;
    formDataObject.phone = phone;
    formDataObject.email = email;

    await saveToRedis(formDataObject);
  } else {
    id = generateCode(6);

    // Create a new object of type CustomFormData
    const formDataObject: CustomFormData = {
      id,
      name,
      phone,
      email,
      // There are other optional fields that will be added in later
    };

    // Save the form data to Redis with a helper in the services folder
    await saveToRedis(formDataObject);
  }

  return redirect(`/form/more?id=${id}`);
};

export const loader: LoaderFunction = async ({ request }) => {
  // This page could possibly not have an ID and that is okay since it is the first page
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (typeof id !== "string" || !id) {
    return null;
  }

  // Get cached form data from Redis
  const formData = await getDataFromRedis(id);

  if (!formData) {
    return null;
  }

  return formData;
};

export default function FormIndex() {
  const data = useLoaderData<CustomFormData | null>();

  return (
    <div>
      <h2 className="text-lg text-gray-600">Basic Info</h2>
      <Form method="post">
        <input type="hidden" name="id" value={data?.id} />
        <label className="mb-1">
          Name
          <input
            type="text"
            name="name"
            placeholder="Name"
            defaultValue={data?.name}
            className="mb-2 w-full p-2 text-lg shadow-md"
          />
        </label>
        <label className="mb-1">
          Phone
          <input
            type="tel"
            name="phone"
            placeholder="(123) 456-7890"
            defaultValue={data?.phone}
            className="mb-2 w-full p-2 text-lg shadow-md"
          />
        </label>
        <label className="mb-1">
          Email
          <input
            type="email"
            name="email"
            defaultValue={data?.email}
            placeholder="test@example.com"
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
