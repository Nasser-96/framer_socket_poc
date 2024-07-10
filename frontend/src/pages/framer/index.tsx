import RotateXYFramerCard from "@/components/framer/rotate-xy-framer-card";
import RotateYFramerCard from "@/components/framer/rotate-y-framer-card";
import RotateYTwoFacesFramerCard from "@/components/framer/rotate-y-two-faces-card";

export default function Framer() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-2 py-3">
      <div className="flex gap-2 justify-between">
        <RotateXYFramerCard />
        <RotateYFramerCard />
      </div>
      <RotateYTwoFacesFramerCard />
    </div>
  );
}
