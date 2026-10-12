import { notFound } from "next/navigation";

/**
 * Catch-all so that any unknown /zh|/en path is rendered inside the locale
 * layout (with header, footer and the localised 404 page) instead of falling
 * through to a layout-less global 404.
 */
export default function CatchAllNotFound() {
  notFound();
}
