import { Button } from "@/components/ui/button";
import React from "react";

export default function Auth() {
  return (
     <div className="w-full h-[650px] flex items-center justify-center bg-gray-50 dark:bg-black">
      <Button 
        variant="outline" 
        className="flex items-center gap-3 px-6 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300"
      >
        <img 
          src="https://www.svgrepo.com/show/355037/google.svg" 
          alt="Google" 
          className="w-5 h-5"
        />
        <span className="text-gray-700 font-medium dark:text-white ">Continue with Google</span>
      </Button>
    </div>
  );
}
