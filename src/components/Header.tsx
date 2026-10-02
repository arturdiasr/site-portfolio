import { client } from "@/sanity/lib/client";
import HeaderClient from "./HeaderClient";

export default async function Header() {
  const query = `*[_type == "category"] | order(order asc, _createdAt asc) { _id, title }`;
  const categories = await client.fetch(query);

  const videoQuery = `count(*[_type == "featuredVideo"])`;
  const videoCount = await client.fetch(videoQuery);

  return (
    <HeaderClient categories={categories} videoCount={videoCount} />
  );
}
