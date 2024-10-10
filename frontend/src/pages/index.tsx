import Button from "@/components/shared/button";
import Modal from "@/components/shared/modal";
import NavigateButtons from "@/components/shared/navigate-buttons";
import useSocket from "@/socket/socket-io";
import useUserStore from "@/core/stores/user-store";
import { MessageFromServer } from "@/core/types&enums/types";
import { useEffect, useRef, useState } from "react";
import useWebSocket from "@/socket/web-socket";

export default function Home() {
  const { socket } = useSocket();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<MessageFromServer[]>([]);
  const { userData } = useUserStore();
  const [shouldScrollToBottom, setShouldScrollToBottom] =
    useState<boolean>(true);
  const messagesRef = useRef<HTMLDivElement>(null);

  const SendMessageToServer = () => {
    if (!message) {
      return;
    }
    socket?.emit("sendMessage", {
      username: userData?.username,
      message: message,
    });

    if (messagesRef.current) {
      const isAtBottom =
        messagesRef.current.scrollHeight - messagesRef.current.clientHeight <=
        messagesRef.current.scrollTop + 1;
      setShouldScrollToBottom(isAtBottom);
    }

    setMessages((prev: MessageFromServer[]) => {
      const temp = [...prev];
      temp.push({ username: userData?.username ?? "", message });
      return temp;
    });
    setMessage("");
  };

  const addNewMessage = (data: MessageFromServer) => {
    if (messagesRef.current) {
      const isAtBottom =
        messagesRef.current.scrollHeight - messagesRef.current.clientHeight <=
        messagesRef.current.scrollTop + 1;
      setShouldScrollToBottom(isAtBottom);
    }
    setMessages((prev: MessageFromServer[]) => {
      const temp = [...prev];
      temp.push(data);
      return temp;
    });
  };

  const scrollToBottom = () => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (shouldScrollToBottom) {
      scrollToBottom();
    }
  }, [messages.length]);

  useEffect(() => {
    if (socket) {
      socket?.off("messageFromUser", (data: MessageFromServer) => {
        addNewMessage(data);
      });
      socket.on("messageFromUser", (data: MessageFromServer) => {
        addNewMessage(data);
      });
    }
    return () => {
      socket?.off("messageFromUser", (data: MessageFromServer) => {
        addNewMessage(data);
      });
    };
  }, [socket]);

  return (
    <div className="h-screen flex flex-col justify-end">
      <NavigateButtons />
      <div
        ref={messagesRef}
        className="overflow-y-scroll h-full border border-slate-800 rounded-lg m-3 px-4 py-2"
      >
        {messages.map((newMessage, index) => {
          return (
            <div className="flex gap-1" key={`new-message-${index}`}>
              <p className="text-green-500">{newMessage.username}:</p>
              <p className="text-white">{newMessage.message}</p>
            </div>
          );
        })}
      </div>
      <div className="">
        <div className="flex gap-4 items-center pt-10 my-3 p-2">
          <Button onClick={() => SendMessageToServer()}>Send Message</Button>
          <input
            type="text"
            title="message"
            onKeyDown={(e) =>
              e.key.toLowerCase() === "enter" && SendMessageToServer()
            }
            className="w-full p-4 rounded-lg"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
      </div>
      <Modal isOpen={isModalOpen}>
        <div className="w-full flex items-center justify-center">
          <Button onClick={() => setIsModalOpen(false)}>Close Modal</Button>
        </div>
      </Modal>
    </div>
  );
}
