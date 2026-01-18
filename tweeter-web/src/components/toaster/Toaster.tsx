import "./Toaster.css";
import { useEffect } from "react";
import { Toast } from "react-bootstrap";
import { useMessageActions, useMessageList } from "./MessageHooks";

interface Props {
    position: string;
}

const Toaster = ({ position }: Props) => {
    const messageList = useMessageList();
    const { deleteMessage } = useMessageActions();

    useEffect(() => {
        const interval = setInterval(() => {
            if (messageList.length) {
                deleteExpiredToasts();
            }
        }, 1000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messageList]);

    const deleteExpiredToasts = () => {
        const now = Date.now();

        for (let message of messageList) {
            if (message.expirationMillisecond > 0 && message.expirationMillisecond < now) {
                deleteMessage(message.id);
            }
        }
    };

    return (
        <>
            <div className={`toaster-container ${position}`}>
                {messageList.map((message, i) => (
                    <Toast
                        id={message.id}
                        key={i}
                        className={message.bootstrapClasses}
                        autohide={false}
                        show={true}
                        onClose={() => deleteMessage(message.id)}
                    >
                        <Toast.Header>
                            <img src="holder.js/20x20?text=%20" className="rounded me-2" alt="" />
                            <strong className="me-auto">{message.title}</strong>
                        </Toast.Header>
                        <Toast.Body>{message.text}</Toast.Body>
                    </Toast>
                ))}
            </div>
        </>
    );
};

export default Toaster;
