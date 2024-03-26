"use client";

import { BounceLoader, PacmanLoader } from "react-spinners";

import Box from "@/components/Box";

const Loading = () => {
  return ( 
    <Box className="h-full flex items-center justify-center">
      <PacmanLoader color="#389fff" size={40} />
    </Box>
  );
}
 
export default Loading;
