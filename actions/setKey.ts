import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

import { Song } from "@/types";
import { Platform } from "@/hooks/useSearch";
import { KeyDao } from "@/soundcloudController/keys";
import { toast } from "react-hot-toast";

const setKey = async (source: Platform, type: KeyDao["type"],  newKey: string): Promise<any | null> => {
  const supabase = createServerComponentClient({
    cookies: cookies
  });

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    console.log(sessionError.message);
    return [];
  }

  const { data, error } = await supabase
    .from('keys')
    .upsert({
      source: "Soundcloud",
      type: "client_id",
      key: newKey,
      user_id: sessionData.session?.user.id,
    });

  if (error) {
    console.log(error.message);
  }
  return (data as any) || null;
};

export default setKey;
