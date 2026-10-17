import { notFound } from "next/navigation";

/**
 * Catch-all so that any unknown path is rendered inside the site layout (with
 * header, footer and the site 404 page) instead of falling through to a
 * layout-less global 404.
 */
export default function CatchAllNotFound() {
  notFound();
}
