import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import {
  deleteFormData,
  getDataFromRedis,
  requireFormData,
} from "~/services/redis.server";
import type { CustomFormData } from "~/types/form";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const id = formData.get("id");

  if (typeof id !== "string") {
    throw Error("Form data is invalid");
  }

  const customFormData = await getDataFromRedis(id);

  if (!customFormData) {
    throw Error("Form data is not found");
  }

  /*
    Here you can use the custom form data however you want, 
    for example adding it to a database
  */

  console.log(customFormData);

  // Can cleanup the form data from Redis
  await deleteFormData(id);

  return redirect(`/`);
};

export const loader: LoaderFunction = async ({ request }) => {
  // Function in redis.server.ts that is reusable for each page of the form
  const formData = await requireFormData(request);
  return formData;
};

export default function MoreForm() {
  const data = useLoaderData<CustomFormData>();

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg text-gray-600">Basic Info</h2>
        <p>Name: {data.name}</p>
        <p>Phone: {data.phone}</p>
        <p>Email: {data.email}</p>
        <Link
          to={`/form?id=${data.id}`}
          className="text-blue-700 hover:underline"
        >
          Edit
        </Link>
      </div>

      <div className="mb-4">
        <h2 className="text-lg text-gray-600">More Info</h2>
        <p>Bio: {data.bio ?? ""}</p>
        <p>Birthday: {data.birthday ?? ""}</p>
        <p>Age: {data.age ?? ""}</p>
        <Link
          to={`/form/more?id=${data.id}`}
          className="text-blue-700 hover:underline"
        >
          Edit
        </Link>
      </div>

      <Form method="post">
        <input type="hidden" name="id" value={data.id} />
        <button className="mx-auto mt-2 block w-1/2 rounded bg-blue-600 py-2 text-white hover:bg-blue-700">
          Submit
        </button>
      </Form>
    </div>
  );
}
