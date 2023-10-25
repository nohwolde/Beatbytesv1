"use client";

import { MySearchContextProvider } from "@/hooks/useSearch";

interface SearchProviderProps {
  children: React.ReactNode;
}

const SearchProvider: React.FC<SearchProviderProps> = ({
  children
}) => {
  return ( 
    <MySearchContextProvider>
      {children}
    </MySearchContextProvider>
   );
}
 
export default SearchProvider;
