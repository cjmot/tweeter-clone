import './Toaster.css';
import { useEffect, useRef } from 'react';
import { Toast } from 'react-bootstrap';
import { useMessageActions, useMessageList } from './MessageHooks';
import { ToasterPresenter } from '../../presenter/ToasterPresenter';
import { MessageView } from '../../presenter/Presenter';

interface Props {
    position: string;
}

const Toaster = ({ position }: Props) => {
    const messageList = useMessageList();
    const { deleteMessage, displayInfoMessage, displayErrorMessage } = useMessageActions();

    const view: MessageView = {
        displayErrorMessage: displayErrorMessage,
        displayInfoMessage: displayInfoMessage,
        deleteMessage: deleteMessage,
    };

    const presenterRef = useRef<ToasterPresenter | null>(null);
    if (!presenterRef.current) {
        presenterRef.current = new ToasterPresenter(view);
    }

    useEffect(() => {
        const interval = setInterval(() => {
            presenterRef.current!.deleteExpiredToasts(messageList);
        }, 1000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messageList]);

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
