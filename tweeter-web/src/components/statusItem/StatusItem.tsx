import Post from "./Post";
import { Status } from "tweeter-shared"
import {Link} from "react-router-dom";
import { MouseEvent } from "react";

interface Props {
    item: Status,
    navigateToUser: (event: MouseEvent,) => Promise<void>
}
const StatusItem = ({ item, navigateToUser }: Props) => {
    return (
        <div className="col bg-light mx-0 px-0">
            <div className="container px-0">
                <div className="row mx-0 px-0">
                    <div className="col-auto p-3">
                        <img
                            src={item.user.imageUrl}
                            className="img-fluid"
                            width="80"
                            alt="Posting user"
                        />
                    </div>
                    <div className="col">
                        <h2>
                            <b>
                                {item.user.firstName} {item.user.lastName}
                            </b>{" "}
                            -{" "}
                            <Link
                                to={`/feed/${item.user.alias}`}
                                onClick={navigateToUser}
                            >
                                {item.user.alias}
                            </Link>
                        </h2>
                        {item.formattedDate}
                        <br />
                        <Post status={item} featurePath="/feed" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StatusItem;