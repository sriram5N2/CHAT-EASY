import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Image from "react-bootstrap/Image";

function ProfileModal({ show, setShow, info, children }) {
    // console.log(info.pic);
    return (
        <div className="profile-modal">
            {show ? (
                <div className="user-modal">
                    <Modal show={show} size="lg" centered>
                        <Modal.Dialog>
                            <Modal.Header>
                                <Modal.Title>
                                    {info.name || "Guest User"}
                                </Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Image
                                    src={info.pic}
                                    alt={info.name}
                                    roundedCircle
                                />
                                <p style={{ textAlign: "center" }}>
                                    {info.email || "@Guest"}
                                </p>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button
                                    variant="outline-success"
                                    onClick={() => setShow(false)}
                                >
                                    Close
                                </Button>
                            </Modal.Footer>
                        </Modal.Dialog>
                    </Modal>
                </div>
            ) : (
                children
            )}
        </div>
    );
}

export default ProfileModal;
