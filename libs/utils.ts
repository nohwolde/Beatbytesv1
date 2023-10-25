import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Collection of functions that are useful but non-specific to any particular files

export function getBetweenStrings(data: string, start_string: any, end_string: any) {
  const regex = new RegExp(
    `${escapeRegExp(start_string)}(.*?)${escapeRegExp(end_string)}`,
    "s"
  );
  const match = data.match(regex);
  return match ? match[1] : undefined;
}

export function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function hexToRgb(hex: string) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function rgbToHex(r: number, g: number, b: number) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export function getCpn() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  let result = "";
  for (let i = 16; i > 0; --i)
    result += chars[Math.round(Math.random() * (chars.length - 1))];
  return result;
}

export function getMutationByKey(key: any, mutations: any[]) {
  if (!key || !mutations) return undefined;
  return mutations.find((mutation: { entityKey: any; }) => mutation.entityKey === key).payload;
}

export function setHttp(link: string) {
  if (link.search(/^http[s]?\:\/\//) == -1) {
    link = "http://" + link;
  }
  return link;
}

export function linkParser(url: any) {
  let result;
  if (url) {
    try {
      const slug = new URL(setHttp(url));
      const host = slug.hostname.toLowerCase().replace(/^(www|m)\./, "");
      if (host == "youtube.com") {
        result = slug;
      } else if (host == "youtu.be") {
        result = new URL("/watch", window.location.origin);
        result.searchParams.set("v", slug.pathname.split("/")[1]);
      }
    } finally {
      return result instanceof URL ? result : false;
    }
  }
}
export const delay = (ms: number | undefined) => new Promise((res) => setTimeout(res, ms));