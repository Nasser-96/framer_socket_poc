import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export enum ModalSizeEnum {
  XLARGE = "XLARGE",
  LARGE = "LARGE",
  MEDIUM = "MEDIUM",
  SMALL = "SMALL",
}

/* eslint-disable-next-line */
export interface ModalProps {
  children: JSX.Element;
  size?: string;
  withConfetti?: boolean;
  imgStyle?: string;
  extraClasses?: string;
  isOpen: boolean;
}

export function Modal({
  children,
  size = ModalSizeEnum.LARGE,
  isOpen,
  extraClasses = "",
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isModalAnimationDone, setIsModalAnimationDone] =
    useState<boolean>(false);
  const DIV = motion.div;

  const getModalSizeClass = (): string => {
    switch (size) {
      case ModalSizeEnum.SMALL:
        return "sm:w-[343px]";
      case ModalSizeEnum.MEDIUM:
        return "sm:w-[484px]";
      case ModalSizeEnum.LARGE:
        return "sm:max-w-2xl";
      case ModalSizeEnum.XLARGE:
        return "lg:max-w-[990px]";
      default:
        return "lg:max-w-2xl";
    }
  };

  useEffect(() => {
    // disable body scrolling behaviour
    window.document.body.style.setProperty("overflow-y", "hidden", "important");
    window.document
      .getElementsByTagName("html")[0]
      .style.setProperty("overflow-y", "hidden", "important");
    window.document.body.style.width = "100%";
    window.document
      .getElementsByTagName("nav")
      ?.item(0)
      ?.classList.add("!z-10");
    return () => {
      // enable body scrolling behaviour
      window.document
        .getElementsByTagName("nav")
        ?.item(0)
        ?.classList.remove("!z-10");
      window.document.body.style.overflowY = "auto";
      window.document.getElementsByTagName("html")[0].style.overflowY = "auto";
    };
  }, []);

  useEffect(() => {
    // check if modal is shown
    if (modalRef?.current) {
      setTimeout(() => {
        setIsModalAnimationDone(true);
      }, 50);
    } else {
      setIsModalAnimationDone(false);
    }
  }, []);

  return (
    <>
      {/* <!--Overlay Effect--> */}
      <motion.div
        initial={false}
        animate={isOpen ? { scale: 1 } : { scale: [1, 2.5, 0] }}
        exit={isOpen ? { scale: 1 } : { scale: 0 }}
        transition={{ duration: 0.4 }}
        className="z-9999 fixed inset-0 min-h-full overflow-hidden bg-white/5 backdrop-blur-md dark:bg-black/30 dark:backdrop-blur-lg"
      />

      <motion.div
        animate={isOpen ? { scale: 1 } : { scale: [1, 2.5, 0] }}
        initial={false}
        transition={{ duration: 0.4 }}
        exit={{ scale: [0] }}
        className="z-9999 fixed inset-0 flex h-full w-full items-center justify-center overflow-hidden"
        ref={modalRef}
      >
        <div
          className={`max-h-800 !bg-slate-700 relative bottom-0 mx-auto mt-10 w-11/12 max-w-lg rounded-2xl p-5 shadow-lg transition-all duration-500 sm:p-8 ${getModalSizeClass()} dark:bg-dark border bg-white dark:border-0
          ${extraClasses}`}
        >
          {children}
        </div>
      </motion.div>
    </>
  );
}

export default Modal;
