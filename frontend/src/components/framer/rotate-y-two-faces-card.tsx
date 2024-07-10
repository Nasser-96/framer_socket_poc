import { motion } from "framer-motion";

export default function RotateYTwoFacesFramerCard() {
  return (
    <motion.div
      className="relative w-[450px] h-[600px] [transform-style:preserve-3d] bg-white rounded-lg"
      animate={{
        rotateY: 360,
      }}
      transition={{
        ease: "linear",
        duration: 4,
        repeat: Infinity,
        repeatType: "loop",
      }}
    >
      <div className="absolute w-full h-full flex-col gap-2 p-2 flex items-center top-0 left-0 justify-center rounded-lg overflow-hidden [backface-visibility:hidden]">
        <div className="w-full h-1/3 bg-green-800">Content First 1</div>
        <div className="flex gap-1 w-full h-1/3">
          <div className="w-full h-full bg-sky-800">Content Second 1</div>
          <div className="flex gap-1 flex-col w-full">
            <div className="w-full h-full bg-orange-800">
              Content Second 2-1
            </div>
            <div className="w-full h-full bg-violet-900">
              Content Second 2-2
            </div>
          </div>
        </div>
        <div className="w-full h-1/3 bg-rose-800">Content First 1</div>
      </div>
      <div className="absolute w-full h-full bg-white p-2 text-white top-0 left-0 flex items-center justify-center rounded-lg [backface-visibility:hidden] [transform:rotateY(180deg)]">
        <div className="bg-blue-500 h-full w-full flex items-center justify-center">
          Back Side
        </div>
      </div>
    </motion.div>
  );
}
