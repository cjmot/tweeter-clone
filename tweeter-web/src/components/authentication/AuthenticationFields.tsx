import { Dispatch, KeyboardEvent, SetStateAction } from "react";

interface Props {
    onEnterHandler: () => Promise<void>;
    checkSubmitButtonStatus: () => boolean;
    setAlias: Dispatch<SetStateAction<string>>;
    setPassword: Dispatch<SetStateAction<string>>;
}

const AuthenticationFields = (props: Props) => {

    const handleEnter = (event: KeyboardEvent<HTMLElement>) => {
        if (event.key == "Enter" && !props.checkSubmitButtonStatus()) {
            props.onEnterHandler();
        }
    };

    return (
        <>
            <div className="form-floating">
                <input
                    type="text"
                    className="form-control"
                    size={50}
                    id="aliasInput"
                    placeholder="name@example.com"
                    onKeyDown={handleEnter}
                    onChange={(event) => props.setAlias(event.target.value)}
                />
                <label htmlFor="aliasInput">Alias</label>
            </div>
            <div className="form-floating mb-3">
                <input
                    type="password"
                    className="form-control bottom"
                    id="passwordInput"
                    placeholder="Password"
                    onKeyDown={handleEnter}
                    onChange={(event) => props.setPassword(event.target.value)}
                />
                <label htmlFor="passwordInput">Password</label>
            </div>
        </>
    )
}

export default AuthenticationFields;