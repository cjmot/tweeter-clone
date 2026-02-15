import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconName } from "@fortawesome/free-solid-svg-icons";

interface Props {
    onButtonClick: () => void;
    oAuthName: string;
    iconName: IconName;
}

const OAuthButton = (props: Props) => {
    return (
        <button type="button" className="btn btn-link btn-floating mx-1" onClick={() => props.onButtonClick()}>
            <OverlayTrigger
                placement="top"
                overlay={<Tooltip id={props.oAuthName.toLowerCase() + "Tooltip"}>{props.oAuthName}</Tooltip>}
            >
                <FontAwesomeIcon icon={["fab", props.iconName]} />
            </OverlayTrigger>
        </button>
    );
};

export default OAuthButton;
