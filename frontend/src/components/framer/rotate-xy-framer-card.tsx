import { motion } from "framer-motion";
import { useState } from "react";

export default function RotateXYFramerCard() {
  const [isHover, setIsHover] = useState<boolean>(false);

  return (
    <motion.div
      animate={{
        //   rotateX: [0, 360], // Rotate X-axis
        rotateY: 360, // Rotate Y-axis
        // rotateZ: [0, 360], // Rotate Z-axis
        originX: 0,
        originY: "50%",
      }}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      transition={{
        ease: "linear",
        duration: 4,
        repeat: Infinity,
        repeatType: "loop",
      }}
      className="h-[600px] w-[450px] bg-white p-2 flex flex-col gap-2"
    >
      <div className="w-full h-1/3 bg-green-800">Content First 1</div>
      <div className="flex gap-1 h-1/3">
        <div className="w-full h-full bg-sky-800">Content Second 1</div>
        <div className="flex gap-1 flex-col w-full">
          <div className="w-full h-full bg-orange-800">Content Second 2-1</div>
          <div className="w-full h-full bg-violet-900">Content Second 2-2</div>
        </div>
      </div>
      <div className="w-full h-1/3 bg-rose-800">Content First 1</div>
    </motion.div>
  );
}
