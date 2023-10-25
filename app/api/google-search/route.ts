import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

import google from 'googlethis';
//@ts-ignore
import googleIt from 'google-it';

export async function POST(
  request: Request
) {
  const { searchTerm, start } = await request.json();

  try {
    const googleResults = await googleIt({
        query: searchTerm,
        limit: 50,
        start: start,
        // "only-urls": true,
    });
    // const urls = googleResults.map((result: {link: string}) => result.link);
    // console.log(urls);
    return NextResponse.json(googleResults);

    // const options = {
    //   page: 0, 
    //   safe: false, // Safe Search
    //   parse_ads: false, // If set to true sponsored results will be parsed
    //   additional_params: { 
    //     // add additional parameters here, see https://moz.com/blog/the-ultimate-guide-to-the-google-search-parameters and https://www.seoquake.com/blog/google-search-param/
    //     hl: 'en' 
    //   }
    // }
      
    // const response = await google.search(searchTerm, options);
    // return NextResponse.json(response);
  } catch (error) {
    console.log("Error searching for tracks:", error);
    new NextResponse('Internal Error', { status: 500 })
  }
};
