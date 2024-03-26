import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

import { Song } from "@/types";
import { Platform } from "@/hooks/useSearch";
import { KeyDao } from "@/soundcloudController/keys";
// import { toast } from "react-hot-toast";

const getKey = async (source: Platform, type: KeyDao["type"]): Promise<any | null> => {
  const supabase = createServerComponentClient({
    cookies: cookies
  });

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    console.log(sessionError.message);
    return null;
  }

  const { data, error } = await supabase
    .from('keys')
    .select('key');

  if (error) {
    console.log(error.message);
  }

  console.log("Key:" , data);

  return (data as any) || null;
};

export default getKey;
