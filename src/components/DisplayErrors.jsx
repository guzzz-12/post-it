import React, {useState, useEffect} from 'react';

const DisplayErrors = (props) => {
  const [error, setError] = useState({});

  useEffect(() => {
    setError(props.error)
  }, [props.error])

  return (
    <div className= {`${!error.status ? "display-errors display-errors--hidden" : "display-errors"}`} >
      <p>Error:</p>
      <p>{error.message}</p>
    </div>
  );
}

export default DisplayErrors;
