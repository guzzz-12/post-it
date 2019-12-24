import React from "react";
import "./confirmModal.scss";

const ConfirmModal = (props) => {
  const deleteHandler = (id) => {
    props.action(id)
  }
  return (
    <React.Fragment>
      {props.show &&
        <div className="modal">
          <div className="modal__content">
            <h1>Confirm delete</h1>
            <div className="modal__buttons">
              <button onClick={() => deleteHandler(props.itemToDelete)}>OK</button>
              <button onClick={props.hide}>Cancel</button>
            </div>
          </div>    
        </div>    
      }
    </React.Fragment>
  );
}

export default ConfirmModal;
