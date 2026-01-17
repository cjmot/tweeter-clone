import { Dispatch, SetStateAction, KeyboardEvent } from "react";

interface Props {
    onEnterHandler: (event: KeyboardEvent<HTMLElement>) => void;
    setAlias: Dispatch<SetStateAction<string>>;
    setPassword: Dispatch<SetStateAction<string>>;
}

const AuthenticationFields = ({ onEnterHandler, setAlias, setPassword }: Props) => {
    return (
        <>
            <div className="form-floating">
                <input
                    type="text"
                    className="form-control"
                    size={50}
                    id="aliasInput"
                    placeholder="name@example.com"
                    onKeyDown={onEnterHandler}
                    onChange={(event) => setAlias(event.target.value)}
                />
                <label htmlFor="aliasInput">Alias</label>
            </div>
            <div className="form-floating mb-3">
                <input
                    type="password"
                    className="form-control bottom"
                    id="passwordInput"
                    placeholder="Password"
                    onKeyDown={onEnterHandler}
                    onChange={(event) => setPassword(event.target.value)}
                />
                <label htmlFor="passwordInput">Password</label>
            </div>
        </>
    )
}

export default AuthenticationFields;