import "./PostStatus.css";
import { useState, MouseEvent, useRef } from "react";
import { useMessageActions } from "../toaster/MessageHooks";
import { useUserInfo } from "../userInfo/UserHooks";
import { PostStatusPresenter, PostStatusView } from "../../presenter/PostStatusPresenter";

const PostStatus = () => {
    const { displayInfoMessage, displayErrorMessage, deleteMessage } = useMessageActions();

    const { currentUser, authToken } = useUserInfo();
    const [post, setPost] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const view: PostStatusView = {
        setIsLoading: setIsLoading,
        clearPost: () => setPost(""),
        displayInfoMessage: displayInfoMessage,
        displayErrorMessage: displayErrorMessage,
        deleteMessage: deleteMessage,
    };

    const presenterRef = useRef<PostStatusPresenter | null>(null);
    if (!presenterRef.current) {
        presenterRef.current = new PostStatusPresenter(view);
    }

    const submitPost = async (event: MouseEvent) => {
        event.preventDefault();
        await presenterRef.current!.submitPost(authToken!, currentUser!, post);
    };

    const clearPost = (event: React.MouseEvent) => {
        event.preventDefault();
        setPost("");
    };

    const checkButtonStatus: () => boolean = () => {
        return !post.trim() || !authToken || !currentUser;
    };

    return (
        <form>
            <div className="form-group mb-3">
                <textarea
                    className="form-control"
                    id="postStatusTextArea"
                    rows={10}
                    placeholder="What's on your mind?"
                    value={post}
                    onChange={(event) => {
                        setPost(event.target.value);
                    }}
                />
            </div>
            <div className="form-group">
                <button
                    id="postStatusButton"
                    className="btn btn-md btn-primary me-1"
                    type="button"
                    disabled={checkButtonStatus()}
                    style={{ width: "8em" }}
                    onClick={submitPost}
                >
                    {isLoading ? (
                        <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                        ></span>
                    ) : (
                        <div>Post Status</div>
                    )}
                </button>
                <button
                    id="clearStatusButton"
                    className="btn btn-md btn-secondary"
                    type="button"
                    disabled={checkButtonStatus()}
                    onClick={clearPost}
                >
                    Clear
                </button>
            </div>
        </form>
    );
};

export default PostStatus;
