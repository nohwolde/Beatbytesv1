import puppeteer,{ HTTPRequest} from "puppeteer";

export interface KeyDao {
  source: Platform;
  type: "client_id";
  key: string;
  last_updated: string;
  created_at: string;
}

import { Platform } from "@/hooks/useSearch";

async function fetchKey(source: Platform, type: KeyDao["type"]): Promise<string | undefined> {
  // const key = await getKey(source, type);

  // if (key) {
  //   return key;
  // } 
  return '';
}

async function storeKey(
  source: Platform,
  type: KeyDao["type"],
  newKey: string,
): Promise<void> {
  console.log("Storing new key: ", newKey);

  // const key = await setKey(source, type, newKey);

  

  // if (!key) {
  //   throw new Error("Could not store key");
  // }

  console.log("Key stored: ", newKey);
  return;
}

function setSoundcloudClientId(clientId: string): void {
  module.exports.soundcloudClientId = clientId;
}

async function fetchNewSoundcloudClientId(): Promise<string> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  let newClientId = "";

  function requestListener(req: HTTPRequest): void {
    const requestUrl = req.url();

    const soundcloudApiV2Regex = /api-v2.soundcloud.com\/.*client_id.*/;
    if (soundcloudApiV2Regex.test(requestUrl)) {
      const match = requestUrl.match(/(client_id=([0-9A-Za-z])+)/g);

      if (match) {
        const newKey = match[0].slice(10);

        newClientId = newKey;
        page.off("request", requestListener);
        browser.close();
      }
    }

    req.continue();
  }

  page.on("request", requestListener);

  page.on("error", (err) => {
    console.error("error at: ", err);
  });

  page.on("pageerror", (pageerr) => {
    console.error("pageerror at: ", pageerr);
  });

  try {
    await page.goto("https://soundcloud.com/discover", {
      waitUntil: "networkidle0",
    });
  } catch (e) {
    // We will expect a navigation error since we will early abort once key is found
    console.error("Caught page error: ", e);
  } finally {
    await browser.close();
  }

  return newClientId;
}

(async () => {
  const soundcloudClientId = await fetchKey(Platform.Soundcloud, "client_id");

  if (soundcloudClientId) {
    setSoundcloudClientId(soundcloudClientId);
  }
})();

export default {
  async refreshSoundcloudClientId() {
    const newClientId = await fetchNewSoundcloudClientId();

    await storeKey(Platform.Soundcloud, "client_id", newClientId);
    module.exports.soundcloudClientId = newClientId;

    return newClientId;
  },
};
